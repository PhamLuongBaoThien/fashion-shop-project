const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cấu hình tính cách cho Bot
const SYSTEM_INSTRUCTION = `
Bạn là Trợ lý ảo của cửa hàng thời trang D.E Fashion.
Nhiệm vụ của bạn:
1. Trả lời câu hỏi về sản phẩm (quần áo, size, chất liệu).
2. Hướng dẫn mua hàng, đổi trả.
3. Luôn thân thiện, dùng emoji, xưng hô là "mình" hoặc "D.E".
4. Nếu khách hỏi câu quá khó hoặc muốn gặp người thật, hãy trả lời: "HANDOVER_TO_ADMIN".
5. Chỉ trả lời ngắn gọn, dưới 3 câu.
`;

const chatWithGemini = async (messageHistory, userMessage) => {
  try {
    // Sử dụng model gemini-1.5-flash cho nhanh và rẻ (miễn phí)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Xây dựng lịch sử chat để Bot hiểu ngữ cảnh
    // messageHistory là mảng các tin nhắn cũ từ DB
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        {
          role: "model",
          parts: [{ text: "Dạ, mình đã hiểu nhiệm vụ ạ!" }],
        },
        ...messageHistory.map(msg => ({
            role: msg.senderType === 'customer' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }))
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    return response.text();
  } catch (error) {
    // console.error("Gemini Error:", error);
    return "Xin lỗi, hệ thống đang bận. Bạn vui lòng chờ nhân viên hỗ trợ nhé!";
  }
};

module.exports = { chatWithGemini };