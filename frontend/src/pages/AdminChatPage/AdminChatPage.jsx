import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  List,
  Avatar,
  Input,
  Button,
  Badge,
  Card,
  Typography,
  Empty,
} from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import styled from "styled-components";
import * as ChatService from "../../services/ChatService";
import { useMessageApi } from "../../context/MessageContext";
import { motion } from "framer-motion";

const { Sider, Content } = Layout;
const { Text } = Typography;

// --- STYLED COMPONENTS ---
const ChatLayout = styled(Layout)`
  height: 72vh; // Điều chỉnh chiều cao để vừa vặn trong Card
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
`;

const UserList = styled(Sider)`
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  height: 100%; // Đảm bảo full chiều cao

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const ChatArea = styled(Content)`
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  height: 100%; // Đảm bảo full chiều cao
`;

const MessageContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* Custom scrollbar cho đẹp */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const MessageBubble = styled.div`
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 14px;
  background-color: ${(props) => (props.isMine ? "#1890ff" : "#fff")};
  color: ${(props) => (props.isMine ? "#fff" : "#333")};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word; // Tránh tràn text nếu quá dài
`;

const InputContainer = styled.div`
  padding: 15px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
`;

const UserItem = styled(List.Item)`
  cursor: pointer;
  transition: background 0.3s;
  padding: 12px 20px !important;
  background-color: ${(props) => (props.isActive ? "#e6f7ff" : "transparent")};
  border-right: ${(props) => (props.isActive ? "3px solid #1890ff" : "none")};

  &:hover {
    background-color: #f5f5f5;
  }
`;

const MessageBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isMine ? "flex-end" : "flex-start")};
`;

const SenderName = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 2px;
  margin-left: 4px;
  margin-right: 4px;
`;

// --- CONFIG ---
const ENDPOINT = process.env.REACT_APP_API_URL;

const AdminChatPage = () => {
  const user = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]); // Danh sách người chat
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]); // Tin nhắn chi tiết
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState(null);

  const { showError } = useMessageApi();

  const scrollRef = useRef();

  // 1. KẾT NỐI SOCKET & LẤY DANH SÁCH CONVERSATION
  useEffect(() => {
    if (user?.access_token) {
      const newSocket = io(ENDPOINT);
      setSocket(newSocket);
      newSocket.emit("join_admin_channel");

      newSocket.on("new_message", (newMsg) => {
        // So sánh dựa trên conversationId, an toàn hơn participants[0]
        if (
          currentConversationId &&
          newMsg.conversationId === currentConversationId
        ) {
          setMessages((prev) => [...prev, newMsg]);
          ChatService.markAsRead(currentConversationId);
        }
        fetchConversations(); // Refresh danh sách bên trái
      });

      fetchConversations();
      return () => newSocket.disconnect();
    }
  }, [user?.access_token, currentConversationId]); // Dependency quan trọng

  // 2. HÀM LẤY DANH SÁCH HỘI THOẠI
  const fetchConversations = async () => {
    try {
      const res = await ChatService.getAllConversations(user?.access_token);
      if (res?.status === "OK") {
        setConversations(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách chat:", error);
      showError("Lỗi lấy danh sách chat");
    }
  };

  // 3. KHI CHỌN MỘT NGƯỜI DÙNG -> LẤY TIN NHẮN CHI TIẾT
  const handleSelectUser = async (conv) => {
    const guest =
      conv.participants.find((p) => p._id !== user.id) || conv.participants[0];

    // Update UI ngay lập tức (Reset badge)
    const updatedConvs = conversations.map((c) =>
      c._id === conv._id ? { ...c, unreadCount: 0 } : c
    );
    setConversations(updatedConvs);

    // FIX: Lưu state rõ ràng
    setSelectedGuest(guest);
    setCurrentConversationId(conv._id);

    ChatService.markAsRead(conv._id);

    try {
      const res = await ChatService.getMessagesById(guest._id);
      if (res?.status === "OK") {
        setMessages(res.data);
      }
    } catch (error) {
      console.error(error);
      showError("Lỗi lấy tin nhắn chi tiết");
    }
  };

  // 4. GỬI TIN NHẮN
  const handleSend = async () => {
    if (!inputText.trim() || !selectedGuest) return;

    const msgData = {
      senderId: user.id,
      receiverId: selectedGuest._id, // FIX: Gửi đúng ID của khách (User ID)
      text: inputText,
      senderType: "admin",
    };

    // Optimistic UI
    const tempMsg = {
      ...msgData,
      sender: { _id: user.id, username: user.username },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText("");

    try {
      await ChatService.createMessage(msgData);
      fetchConversations();
    } catch (error) {
      console.error("Gửi lỗi:", error);
      showError("Gửi tin nhắn thất bại");
    }
  };

  // 5. AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderLastMessage = (conv) => {
    const lastMsg = conv.lastMessage;
    if (!lastMsg)
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Chưa có tin nhắn
        </Text>
      );

    const sender = lastMsg.sender;
    const text = lastMsg.text;

    // 1. Nếu người gửi là chính mình (Admin đang login)
    if (sender?._id === user.id) {
      return (
        <Text ellipsis type="secondary" style={{ fontSize: 12 }}>
          <span style={{ fontWeight: "bold" }}>Bạn: </span> {text}
        </Text>
      );
    }

    // 2. Nếu người gửi là một Admin KHÁC
    if (sender?.isAdmin) {
      return (
        <Text ellipsis type="secondary" style={{ fontSize: 12 }}>
          <span style={{ fontWeight: "bold", color: "#1890ff" }}>
            {sender.username || "Admin"}:
          </span>{" "}
          {text}
        </Text>
      );
    }

    // 3. Nếu người gửi là Khách hàng (hoặc Bot giả lập khách)
    // Không cần prefix, chỉ hiện nội dung
    return (
      <Text
        ellipsis
        type="secondary"
        style={{
          fontSize: 12,
          fontWeight: conv.unreadCount > 0 ? "bold" : "normal",
          color: conv.unreadCount > 0 ? "#333" : undefined,
        }}
      >
        {text}
      </Text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        {/* 3. Sử dụng class admin-page-header từ admin.css */}
        <div className="admin-page-header">
          <h1>Chăm sóc khách hàng</h1>
        </div>
        <ChatLayout>
          {/* CỘT TRÁI: DANH SÁCH KHÁCH */}
          <UserList width={300} theme="light">
            <List
              itemLayout="horizontal"
              dataSource={conversations}
              renderItem={(conv) => {
                const guest =
                  conv.participants.find((p) => p._id !== user.id) ||
                  conv.participants[0];
                // Kiểm tra ID hội thoại thay vì ID guest để chính xác hơn
                const isSelected = currentConversationId === conv._id;
                return (
                  <UserItem
                    isActive={isSelected}
                    onClick={() => handleSelectUser(conv)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={conv.unreadCount} offset={[-5, 5]}>
                          <Avatar src={guest?.avatar} icon={<UserOutlined />} />
                        </Badge>
                      }
                      title={
                        guest?.username || guest?.email || "Khách vãng lai"
                      }
                      description={renderLastMessage(conv)}
                    />
                    <div style={{ fontSize: 10, color: "#ccc" }}>
                      {new Date(conv.updatedAt).toLocaleDateString("vi-VN")}
                    </div>
                  </UserItem>
                );
              }}
            />
          </UserList>

          {/* CỘT PHẢI: KHUNG CHAT */}
          <ChatArea>
            {selectedGuest ? (
              <>
                <div
                  style={{
                    padding: "15px",
                    background: "#fff",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: "bold",
                  }}
                >
                  {selectedGuest.username || selectedGuest.email}
                </div>
                <MessageContainer>
                  {messages.map((msg, index) => {
                    const senderId =
                      typeof msg.sender === "object"
                        ? msg.sender._id
                        : msg.sender;

                    const isMine =
                      msg.senderType === "admin" && senderId === user.id;

                    // Nếu là tin nhắn hệ thống Admin (bao gồm cả mình và admin khác)
                    const isAdminMessage = msg.senderType === "admin";

                    // Tên hiển thị
                    let displayName = "";
                    if (
                      msg.senderType === "customer" ||
                      msg.senderType === "guest"
                    ) {
                      displayName = selectedGuest.username || "Khách hàng";
                    } else if (msg.senderType === "bot") {
                      displayName = "Trợ lý ảo";
                    } else {
                      // --- LOGIC HIỂN THỊ TÊN ADMIN ---
                      if (isMine) {
                        displayName = "Bạn";
                      } else if (typeof msg.sender === "object") {
                        // Nếu sender là object (đã populate), lấy tên thật
                        const adminName =
                          msg.sender.username || msg.sender.name;
                        displayName = adminName
                          ? `Admin (${adminName})`
                          : "Admin";
                      } else {
                        displayName = "Admin";
                      }
                    }

                    return (
                      <MessageBlock key={index} isMine={isAdminMessage}>
                        {/* Hiển thị tên người gửi */}
                        <SenderName>{displayName}</SenderName>

                        <MessageBubble isMine={isAdminMessage}>
                          {msg.text}
                        </MessageBubble>
                      </MessageBlock>
                    );
                  })}
                  <div ref={scrollRef} />
                </MessageContainer>
                <InputContainer>
                  <Input
                    size="large"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onPressEnter={handleSend}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                  >
                    Gửi
                  </Button>
                </InputContainer>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#999",
                }}
              >
                <Empty description="Chọn một khách hàng để bắt đầu chat" />
              </div>
            )}
          </ChatArea>
        </ChatLayout>
      </Card>
    </motion.div>
  );
};

export default AdminChatPage;
