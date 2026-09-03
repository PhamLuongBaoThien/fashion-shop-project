import { axiosJWT } from "./UserService";

const API_BASE_URL = process.env.REACT_APP_API_KEY;

// Nhóm API khách hàng: AI và support là hai lịch sử hoàn toàn độc lập.
export const getAIMessages = async () => {
  const response = await axiosJWT.get(`${API_BASE_URL}/chat/ai/messages`);
  return response.data;
};

export const sendAIMessage = async (text) => {
  const response = await axiosJWT.post(`${API_BASE_URL}/chat/ai/messages`, {
    text,
  });
  return response.data;
};

export const getSupportMessages = async () => {
  const response = await axiosJWT.get(`${API_BASE_URL}/chat/support/messages`);
  return response.data;
};

export const sendSupportMessage = async (text) => {
  const response = await axiosJWT.post(
    `${API_BASE_URL}/chat/support/messages`,
    { text }
  );
  return response.data;
};

// Nhóm API Admin: chỉ tải và trả lời support conversation.
export const getAdminSupportConversations = async () => {
  const response = await axiosJWT.get(`${API_BASE_URL}/chat/admin/support`);
  return response.data;
};

export const getAdminSupportMessages = async (conversationId) => {
  const response = await axiosJWT.get(
    `${API_BASE_URL}/chat/admin/support/${conversationId}/messages`
  );
  return response.data;
};

export const sendAdminSupportMessage = async (conversationId, text) => {
  const response = await axiosJWT.post(
    `${API_BASE_URL}/chat/admin/support/${conversationId}/messages`,
    { text }
  );
  return response.data;
};

// Backend dựa vào JWT để đánh dấu đúng phía customer hoặc admin đã đọc.
export const markAsRead = async (conversationId) => {
  const response = await axiosJWT.patch(
    `${API_BASE_URL}/chat/${conversationId}/read`
  );
  return response.data;
};
