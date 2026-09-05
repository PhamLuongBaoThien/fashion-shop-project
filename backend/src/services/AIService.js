const { GoogleGenAI, FunctionCallingConfigMode } = require("@google/genai");
const dotenv = require("dotenv");
const { TOOL_DECLARATIONS, executeToolCall } = require("./AIToolService");

dotenv.config();

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
Bạn là trợ lý ảo của cửa hàng thời trang D.E Fashion.

Phạm vi hỗ trợ duy nhất:
- Tìm và tư vấn sản phẩm bằng tool search_products.
- Trả lời chính sách cửa hàng bằng tool get_policy.
- Chuyển khách sang nhân viên bằng tool request_support.

Quy tắc bắt buộc:
1. Luôn gọi search_products khi khách muốn tìm, xem, so sánh hoặc được gợi ý sản phẩm. Trích xuất query, danh mục, size, khoảng giá, sản phẩm mới và số lượng từ ý nghĩa câu hỏi.
2. Khi khách nói "gợi ý thêm", "xem thêm" hoặc "sản phẩm khác", dùng lại nhu cầu trong lịch sử và đặt excludePrevious=true.
3. Luôn gọi get_policy khi khách hỏi giao hàng, đổi trả/hoàn tiền, thanh toán, bảo mật hoặc điều khoản. Không trả lời chính sách bằng kiến thức tự có.
4. Chỉ gọi request_support khi khách chủ động muốn gặp hoặc nói chuyện với nhân viên; không gọi chỉ vì câu hỏi khó.
5. Phân biệt từ theo ngữ cảnh. Ví dụ "áo polo" là sản phẩm nhưng "nước Áo" là quốc gia và nằm ngoài phạm vi.
6. Nếu câu hỏi ngoài ba phạm vi trên, không gọi tool; từ chối lịch sự trong một hoặc hai câu và mời khách hỏi về sản phẩm hoặc chính sách.
7. Không hỗ trợ giờ mở cửa, địa chỉ hoặc thông tin cửa hàng vì chưa có tool tương ứng.
8. Mỗi câu hỏi chỉ chọn tối đa một tool. Backend sẽ tự chạy tool và trình bày kết quả, bạn không cần soạn câu trả lời sau tool.
9. Nếu không cần tool, trả lời bằng tiếng Việt, thân thiện, ngắn gọn và không dùng Markdown hoặc ký hiệu **.
`;

// Chuyển lịch sử Message đã lưu sang định dạng role/parts của SDK mới.
const buildHistory = (messageHistory = []) => {
  const history = [];

  messageHistory.forEach((message) => {
    const text = String(message.text || "").trim();
    if (!text) return;

    const role = ["customer", "guest"].includes(message.senderType)
      ? "user"
      : "model";
    const previous = history[history.length - 1];

    if (previous?.role === role) {
      previous.parts[0].text += `\n${text}`;
    } else {
      history.push({ role, parts: [{ text }] });
    }
  });

  if (history[0]?.role === "model") {
    history.unshift({ role: "user", parts: [{ text: "Xin chào" }] });
  }
  return history;
};

const getPreviouslyRecommendedIds = (messageHistory = []) =>
  messageHistory.flatMap((message) =>
    (message.recommendations || []).map((product) =>
      String(product?._id || product)
    )
  );

const createClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const uniqueRecommendationIds = (toolResults) =>
  [...new Set(toolResults.flatMap((result) => result.recommendationIds || []))]
    .slice(0, 3);

const normalizeForMatching = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const POLICY_STOP_WORDS = new Set([
  "toi", "minh", "ban", "shop", "cho", "hoi", "ve", "la", "gi",
  "co", "khong", "duoc", "nhu", "the", "nao", "cua", "thi", "a",
]);

/**
 * Chọn đoạn gần câu hỏi nhất trong policy đã publish. Đây chỉ là bước truy hồi
 * nội dung sau khi Gemini đã chọn get_policy, không dùng để phân loại intent.
 */
const selectPolicyExcerpt = (content = "", userMessage = "") => {
  const lines = String(content)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return "";

  const terms = [...new Set(normalizeForMatching(userMessage).split(" "))]
    .filter((term) => term.length >= 2 && !POLICY_STOP_WORDS.has(term));
  const scores = lines.map((line) => {
    const normalizedLine = normalizeForMatching(line);
    return terms.reduce(
      (score, term) => score + (normalizedLine.includes(term) ? 1 : 0),
      0
    );
  });
  const bestIndex = scores.indexOf(Math.max(...scores));
  const start = Math.max(bestIndex - 1, 0);
  const selected = lines.slice(start, Math.min(start + 4, lines.length));
  const excerpt = selected.join("\n");

  return excerpt.length > 800 ? `${excerpt.slice(0, 797).trim()}...` : excerpt;
};

// Backend tự định dạng kết quả tool để mỗi tin nhắn chỉ tốn một Gemini request.
const formatToolResults = (toolResults, userMessage) => {
  const productResult = toolResults.find((result) => result.name === "search_products");
  if (productResult?.response?.status === "needs_clarification") {
    return "Bạn muốn tìm loại sản phẩm, size và khoảng giá nào?";
  }
  if (productResult?.response?.status === "not_found") {
    return "Mình chưa tìm thấy sản phẩm phù hợp và còn hàng. Bạn muốn đổi loại sản phẩm hoặc khoảng giá không?";
  }
  if (productResult) {
    const count = productResult.response?.products?.length || 0;
    return `Mình tìm thấy ${count} sản phẩm phù hợp. Bạn xem các gợi ý bên dưới nhé.`;
  }

  const policyResult = toolResults.find((result) => result.name === "get_policy");
  if (policyResult?.response?.status === "success") {
    const policy = policyResult.response.policy;
    const excerpt = selectPolicyExcerpt(policy.content, userMessage);
    return `Theo ${policy.title.toLowerCase()}:\n${excerpt}\nXem đầy đủ: ${policy.url}`;
  }
  if (policyResult) {
    return "Chính sách này hiện chưa được công bố. Bạn hãy chuyển sang tab Nhân viên để được hỗ trợ nhé.";
  }

  return "Bạn hãy chuyển sang tab Nhân viên và gửi nội dung cần hỗ trợ nhé.";
};

/**
 * Chỉ công khai trạng thái quota trong bản demo khi Gemini trả đúng lỗi 429.
 * Những lỗi cấu hình, mạng hoặc database vẫn dùng thông báo chung.
 */
const getGeminiFallbackText = (error) => {
  const details = `${error?.message || ""} ${error?.statusText || ""}`;
  const isRateLimited = error?.status === 429 || /RESOURCE_EXHAUSTED|quota exceeded/i.test(details);
  const isDailyQuota = /GenerateRequestsPerDayPerProjectPerModel|requests per day/i.test(details);

  if (isDailyQuota) {
    return "Bản demo đã đạt giới hạn Gemini API miễn phí hôm nay. Bạn vui lòng thử lại khi quota được làm mới hoặc chuyển sang tab Nhân viên hỗ trợ nhé!";
  }
  if (isRateLimited) {
    return "Trợ lý AI đang nhận quá nhiều yêu cầu. Bạn vui lòng thử lại sau ít phút hoặc chuyển sang tab Nhân viên hỗ trợ nhé!";
  }
  return "Xin lỗi, trợ lý AI đang tạm thời gián đoạn. Bạn có thể thử lại hoặc chuyển sang tab Nhân viên hỗ trợ nhé!";
};

/**
 * Chỉ gọi Gemini một lần để hiểu ngữ nghĩa và chọn tool. Backend thực thi tool,
 * truy vấn dữ liệu thật rồi tự tạo câu trả lời để tiết kiệm quota.
 */
const chatWithGemini = async (messageHistory, userMessage) => {
  try {
    const ai = createClient();
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: buildHistory(messageHistory),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
        maxOutputTokens: 350,
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
        toolConfig: {
          functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
        },
      },
    });

    const firstResponse = await chat.sendMessage({ message: userMessage });
    const functionCalls = firstResponse.functionCalls || [];

    // Không có tool call nghĩa là Gemini đã xác định câu hỏi ngoài phạm vi.
    if (!functionCalls.length) {
      return {
        text: firstResponse.text?.trim() || "Mình chỉ hỗ trợ sản phẩm và chính sách của D.E Fashion.",
        recommendations: [],
      };
    }

    const context = {
      previouslyRecommendedIds: getPreviouslyRecommendedIds(messageHistory),
    };
    const toolResults = await Promise.all(
      functionCalls.map((call) => executeToolCall(call, context))
    );

    return {
      text: formatToolResults(toolResults, userMessage),
      recommendations: uniqueRecommendationIds(toolResults),
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: getGeminiFallbackText(error),
      recommendations: [],
    };
  }
};

module.exports = { chatWithGemini, buildHistory };
