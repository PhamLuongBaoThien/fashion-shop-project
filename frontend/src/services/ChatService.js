import { axiosJWT } from "./UserService"; 

const API_BASE_URL = process.env.REACT_APP_API_KEY;

// Lấy lịch sử tin nhắn
export const getMessages = async () => {
    const res = await axiosJWT.get(`${API_BASE_URL}/chat/get-messages`);
    return res.data;
};

export const getMessagesById = async (userId) => {
    const res = await axiosJWT.get(`${API_BASE_URL}/chat/get-messages/${userId}`);
    return res.data;
};

export const createMessage = async (data) => {
    // data: { text, senderId, receiverId, senderType }
    const res = await axiosJWT.post(`${API_BASE_URL}/chat/create`, data);
    return res.data;
};

export const getAllConversations = async () => {
    const res = await axiosJWT.get(`${API_BASE_URL}/chat/get-conversations`);
    return res.data;
};

export const markAsRead = async (conversationId) => {
    const res = await axiosJWT.post(`${API_BASE_URL}/chat/read`, { conversationId });
    return res.data;
};