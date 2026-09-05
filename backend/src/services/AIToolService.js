const Product = require("../models/ProductModel");
const { Policy, POLICY_TYPES } = require("../models/PolicyModel");
require("../models/CategoryModel");

const MAX_RECOMMENDATIONS = 3;

// Gemini chỉ được chọn các tool này; backend vẫn kiểm tra tham số và truy vấn DB.
const TOOL_DECLARATIONS = [
  {
    name: "search_products",
    description:
      "Tìm sản phẩm thời trang thật trong catalog D.E Fashion. Dùng khi khách muốn tìm, xem, so sánh hoặc được tư vấn sản phẩm. Không dùng khi từ Áo là tên quốc gia.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Từ mô tả có thể tìm trong tên, danh mục hoặc mô tả sản phẩm. Bỏ trống nếu khách chỉ lọc theo giá hoặc sản phẩm mới.",
        },
        category: { type: "string", description: "Tên danh mục nếu có." },
        minPrice: { type: "number", minimum: 0, description: "Giá bán tối thiểu bằng VND." },
        maxPrice: { type: "number", minimum: 0, description: "Giá bán tối đa bằng VND." },
        size: { type: "string", description: "Size khách cần, ví dụ S, M, L, XL." },
        isNew: { type: "boolean", description: "True khi khách yêu cầu sản phẩm mới." },
        sort: {
          type: "string",
          enum: ["relevance", "newest", "price_asc", "price_desc"],
        },
        limit: { type: "integer", minimum: 1, maximum: 3 },
        excludePrevious: {
          type: "boolean",
          description: "True khi khách muốn xem thêm để không lặp card cũ.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_policy",
    description:
      "Lấy chính sách đã xuất bản khi khách hỏi giao hàng, đổi trả/hoàn tiền, thanh toán, bảo mật hoặc điều khoản.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: POLICY_TYPES,
          description: "shipping, return, payment, privacy hoặc terms.",
        },
      },
      required: ["type"],
      additionalProperties: false,
    },
  },
  {
    name: "request_support",
    description:
      "Dùng khi khách chủ động yêu cầu gặp hoặc nói chuyện với nhân viên. Không dùng chỉ vì câu hỏi khó.",
    parametersJsonSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

const STOP_WORDS = new Set([
  "toi", "minh", "ban", "shop", "muon", "can", "giup", "cho", "voi",
  "mot", "nhung", "cac", "loai", "nao", "co", "khong", "duoc", "phu",
  "hop", "goi", "y", "tu", "van", "tim", "mua", "gia", "san", "pham",
  "mau", "khoang", "tam", "duoi", "tren", "them", "khac", "xem",
]);

// Chuẩn hóa chỉ chạy sau khi Gemini đã chọn search_products, không dùng đoán intent.
const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSearchTerms = (...values) =>
  [...new Set(normalizeText(values.filter(Boolean).join(" ")).split(" "))]
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word))
    .slice(0, 12);

const safeString = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const safePrice = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0
    ? Math.min(Math.round(number), 100_000_000)
    : null;
};

const salePrice = (product) =>
  Math.round(product.price * (1 - (product.discount || 0) / 100));

const hasStock = (product) =>
  product.hasSizes
    ? product.sizes?.some((item) => item.quantity > 0)
    : product.stock > 0;

const scoreProduct = (product, terms) => {
  const name = normalizeText(product.name);
  const category = normalizeText(product.category?.name);
  const description = normalizeText(product.description);
  return terms.reduce((score, term) => {
    if (name.includes(term)) score += 6;
    if (category.includes(term)) score += 4;
    if (description.includes(term)) score += 1;
    return score;
  }, 0);
};

const formatProduct = (product) => ({
  id: String(product._id),
  name: product.name,
  category: product.category?.name || "Chưa phân loại",
  price: product.price,
  salePrice: salePrice(product),
  discount: product.discount || 0,
  availableSizes: product.hasSizes
    ? product.sizes.filter((item) => item.quantity > 0).map((item) => item.size)
    : [],
  stock: product.hasSizes
    ? product.sizes.reduce((sum, item) => sum + item.quantity, 0)
    : product.stock,
  rating: product.rating || 0,
  isNew: Boolean(product.isNewProduct),
  url: `/product/${product.slug}`,
});

/**
 * Thực thi search_products bằng catalog thật. Tool args chỉ là gợi ý từ AI;
 * hàm này giới hạn dữ liệu và chỉ trả sản phẩm còn hàng.
 */
const searchProducts = async (rawArgs = {}, context = {}) => {
  const query = safeString(rawArgs.query, 120);
  const category = safeString(rawArgs.category, 80);
  const size = safeString(rawArgs.size, 20);
  let minPrice = safePrice(rawArgs.minPrice);
  let maxPrice = safePrice(rawArgs.maxPrice);
  const isNew = rawArgs.isNew === true;
  const limit = Math.min(Math.max(parseInt(rawArgs.limit, 10) || MAX_RECOMMENDATIONS, 1), MAX_RECOMMENDATIONS);
  let sort = ["relevance", "newest", "price_asc", "price_desc"].includes(rawArgs.sort)
    ? rawArgs.sort
    : "relevance";
  if (isNew && sort === "relevance") sort = "newest";

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const terms = getSearchTerms(query, category);
  if (!terms.length && !size && minPrice === null && maxPrice === null && !isNew) {
    return {
      response: {
        status: "needs_clarification",
        message: "Hãy hỏi khách loại sản phẩm, size hoặc khoảng giá mong muốn.",
      },
      recommendationIds: [],
    };
  }

  const excludedIds = rawArgs.excludePrevious === true
    ? (context.previouslyRecommendedIds || []).filter((id) => /^[a-f\d]{24}$/i.test(String(id)))
    : [];

  const products = await Product.find({
    isActive: true,
    ...(isNew ? { isNewProduct: true } : {}),
    ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
  })
    .select("name category price discount stock sizes hasSizes slug rating description isNewProduct createdAt")
    .populate("category", "name slug")
    .limit(200)
    .lean();

  const normalizedSize = normalizeText(size);
  const ranked = products
    .filter(hasStock)
    .filter((product) => {
      const price = salePrice(product);
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      if (
        normalizedSize &&
        (!product.hasSizes ||
          !product.sizes.some((item) => item.quantity > 0 && normalizeText(item.size) === normalizedSize))
      ) return false;
      return true;
    })
    .map((product, index) => ({ product, score: scoreProduct(product, terms), index }))
    .filter(({ score }) => !terms.length || score > 0);

  ranked.sort((a, b) => {
    if (sort === "newest") return new Date(b.product.createdAt) - new Date(a.product.createdAt);
    if (sort === "price_asc") return salePrice(a.product) - salePrice(b.product);
    if (sort === "price_desc") return salePrice(b.product) - salePrice(a.product);
    return b.score - a.score || b.product.rating - a.product.rating || a.index - b.index;
  });

  const results = ranked.slice(0, limit).map(({ product }) => formatProduct(product));
  return {
    response: results.length
      ? {
          status: "success",
          products: results,
          message: "UI tự hiển thị card. Trả lời ngắn, không liệt kê lại tên, giá hoặc URL.",
        }
      : {
          status: "not_found",
          products: [],
          message: "Không có sản phẩm phù hợp và còn hàng; hãy hỏi khách muốn đổi tiêu chí nào.",
        },
    recommendationIds: results.map((product) => product.id),
  };
};

const htmlToText = (html = "") =>
  String(html)
    .replace(/<\/(p|h1|h2|h3|li|ul|ol|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n\s*\n+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

/** Lấy đúng một Policy đã publish; bản nháp không được đưa cho Gemini. */
const getPolicy = async (rawArgs = {}) => {
  const type = typeof rawArgs.type === "string" ? rawArgs.type : "";
  if (!POLICY_TYPES.includes(type)) {
    return {
      response: { status: "invalid_request", message: "Loại chính sách không hợp lệ." },
      recommendationIds: [],
    };
  }

  const policy = await Policy.findOne({ type, isPublished: true })
    .select("title type slug content updatedAt")
    .lean();

  return {
    response: policy
      ? {
          status: "success",
          policy: {
            title: policy.title,
            type: policy.type,
            content: htmlToText(policy.content),
            updatedAt: policy.updatedAt,
            url: `/policies/${policy.slug}`,
          },
          message: "Chỉ trả lời từ chính sách này và kèm URL nếu khách cần xem đầy đủ.",
        }
      : {
          status: "not_found",
          message: "Chính sách chưa xuất bản; hướng khách sang tab Nhân viên.",
        },
    recommendationIds: [],
  };
};

/** Chỉ thực thi tên tool nằm trong whitelist, không gọi hàm tùy ý từ model. */
const executeToolCall = async (call, context = {}) => {
  if (call?.name === "search_products") {
    return { name: call.name, ...(await searchProducts(call.args, context)) };
  }
  if (call?.name === "get_policy") {
    return { name: call.name, ...(await getPolicy(call.args)) };
  }
  if (call?.name === "request_support") {
    return {
      name: call.name,
      response: { status: "success", message: "Hướng khách sang tab Nhân viên." },
      recommendationIds: [],
    };
  }
  return {
    name: call?.name || "unknown_tool",
    response: { status: "error", message: "Tool không được phép." },
    recommendationIds: [],
  };
};

module.exports = { TOOL_DECLARATIONS, executeToolCall, searchProducts, getPolicy };
