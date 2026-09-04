const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const { Policy, POLICY_TYPES } = require("../models/PolicyModel");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Slug cố định giúp các liên kết chính sách không đổi khi Admin sửa tiêu đề.
const POLICY_SLUGS = {
  shipping: "shipping-policy",
  return: "return-policy",
  payment: "payment-policy",
  privacy: "privacy-policy",
  terms: "terms-and-conditions",
};

// Chỉ giữ các thẻ định dạng cần cho nội dung chính sách và loại bỏ script/HTML nguy hiểm.
const sanitizePolicyContent = (content = "") =>
  DOMPurify.sanitize(String(content), {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "blockquote",
      "pre",
      "code",
    ],
    ALLOWED_ATTR: [],
  });

const hasVisibleContent = (html = "") =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;

const validateAndPrepare = (data) => {
  const title = String(data.title || "").trim();
  const type = String(data.type || "").trim();
  const content = sanitizePolicyContent(data.content);

  if (!title) throw Object.assign(new Error("Vui lòng nhập tiêu đề chính sách"), { statusCode: 400 });
  if (!POLICY_TYPES.includes(type)) {
    throw Object.assign(new Error("Loại chính sách không hợp lệ"), { statusCode: 400 });
  }
  if (!hasVisibleContent(content)) {
    throw Object.assign(new Error("Vui lòng nhập nội dung chính sách"), { statusCode: 400 });
  }

  return {
    title,
    type,
    slug: POLICY_SLUGS[type],
    content,
    isPublished: data.isPublished === true,
  };
};

// API công khai chỉ trả về các chính sách đã được Admin xuất bản.
const getPublishedPolicies = async () =>
  Policy.find({ isPublished: true })
    .select("title type slug updatedAt")
    .sort({ type: 1 })
    .lean();

const getPublishedPolicyBySlug = async (slug) =>
  Policy.findOne({ slug, isPublished: true })
    .select("title type slug content updatedAt")
    .lean();

// Danh sách quản trị gồm cả bản nháp để Admin có thể tiếp tục chỉnh sửa.
const getAllPoliciesForAdmin = async () =>
  Policy.find()
    .populate("updatedBy", "username email")
    .sort({ updatedAt: -1 })
    .lean();

const createPolicy = async (data, adminId) => {
  const prepared = validateAndPrepare(data);
  return Policy.create({ ...prepared, updatedBy: adminId });
};

const updatePolicy = async (policyId, data, adminId) => {
  const policy = await Policy.findById(policyId);
  if (!policy) return null;

  const prepared = validateAndPrepare(data);
  Object.assign(policy, prepared, { updatedBy: adminId });
  return policy.save();
};

const deletePolicy = async (policyId) => Policy.findByIdAndDelete(policyId);

module.exports = {
  getPublishedPolicies,
  getPublishedPolicyBySlug,
  getAllPoliciesForAdmin,
  createPolicy,
  updatePolicy,
  deletePolicy,
  sanitizePolicyContent,
};
