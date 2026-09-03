import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Empty,
  Input,
  Layout,
  List,
  Spin,
  Typography,
} from "antd";
import { RobotOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import styled from "styled-components";
import { motion } from "framer-motion";
import * as ChatService from "../../services/ChatService";
import { useMessageApi } from "../../context/MessageContext";

const { Sider, Content } = Layout;
const { Text } = Typography;

const ChatLayout = styled(Layout)`
  height: 72vh;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
`;

const ConversationList = styled(Sider)`
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  height: 100%;
`;

const ChatArea = styled(Content)`
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  height: 100%;
  min-width: 0;
`;

const ChatHeader = styled.div`
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
`;

const ContextPanel = styled.div`
  padding: 8px 12px 0;
  background: #f5f5f5;

  .ant-collapse-content-box {
    max-height: 180px;
    overflow-y: auto;
  }
`;

const ContextMessage = styled.div`
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  white-space: pre-wrap;

  &:last-child {
    border-bottom: none;
  }
`;

const MessageContainer = styled.div`
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isMine ? "flex-end" : "flex-start")};
`;

const MessageBubble = styled.div`
  max-width: 65%;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 14px;
  background-color: ${(props) => (props.isMine ? "#1890ff" : "#fff")};
  color: ${(props) => (props.isMine ? "#fff" : "#333")};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-break: break-word;
  white-space: pre-wrap;
`;

const SenderName = styled.div`
  font-size: 11px;
  color: #888;
  margin: 0 4px 2px;
`;

const InputContainer = styled.div`
  padding: 15px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
`;

const ConversationItem = styled(List.Item)`
  cursor: pointer;
  padding: 12px 20px !important;
  background-color: ${(props) => (props.isActive ? "#e6f7ff" : "transparent")};
  border-right: ${(props) => (props.isActive ? "3px solid #1890ff" : "none")};

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ENDPOINT =
  process.env.REACT_APP_NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL_PROD
    : process.env.REACT_APP_API_URL;

// Chống hiển thị trùng khi Admin vừa nhận HTTP response vừa nhận Socket event.
const appendUnique = (messages, message) => {
  if (!message?._id) return messages;
  if (messages.some((item) => String(item._id) === String(message._id))) {
    return messages;
  }
  return [...messages, message];
};

const AdminChatPage = () => {
  const user = useSelector((state) => state.user);
  const { showError } = useMessageApi();
  const selectedIdRef = useRef(null);
  const scrollRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contextMessages, setContextMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    selectedIdRef.current = selectedConversation?._id || null;
  }, [selectedConversation]);

  // Trang Admin chỉ tải support conversations, sắp xếp do backend xử lý.
  const fetchConversations = useCallback(async () => {
    try {
      const response = await ChatService.getAdminSupportConversations();
      if (response.status === "OK") setConversations(response.data || []);
    } catch (error) {
      console.error("Không thể tải support conversations:", error);
      showError("Không thể tải danh sách hỗ trợ");
    }
  }, [showError]);

  useEffect(() => {
    if (user?.access_token) fetchConversations();
  }, [fetchConversations, user?.access_token]);

  useEffect(() => {
    if (!user?.access_token) return undefined;

    // Tất cả Admin vào room admins:support do server cấp từ JWT.
    const socket = io(ENDPOINT, {
      path: "/socket.io/",
      transports: ["polling"],
      withCredentials: true,
      auth: { token: user.access_token },
    });

    socket.on("chat:message", ({ conversationId, conversationType, message }) => {
      if (conversationType !== "support") return;

      if (String(selectedIdRef.current) === String(conversationId)) {
        setMessages((current) => appendUnique(current, message));
        ChatService.markAsRead(conversationId).catch(() => {});

        // Khách gửi tin mới sẽ làm mới snapshot 10 tin AI, nên tải lại context.
        if (message.senderType === "customer") {
          ChatService.getAdminSupportMessages(conversationId)
            .then((response) => {
              if (
                response.status === "OK" &&
                String(selectedIdRef.current) === String(conversationId)
              ) {
                setContextMessages(response.data.contextMessages || []);
              }
            })
            .catch(() => {});
        }
      }
      fetchConversations();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });

    return () => socket.disconnect();
  }, [fetchConversations, user?.access_token]);

  // Tải đồng thời lịch sử support và ngữ cảnh AI khi Admin chọn một khách.
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setIsLoading(true);
    setConversations((current) =>
      current.map((item) =>
        item._id === conversation._id ? { ...item, unreadCount: 0 } : item
      )
    );

    try {
      const response = await ChatService.getAdminSupportMessages(conversation._id);
      if (response.status === "OK") {
        setSelectedConversation(response.data.conversation);
        setMessages(response.data.messages || []);
        setContextMessages(response.data.contextMessages || []);
        await ChatService.markAsRead(conversation._id);
      }
    } catch (error) {
      console.error("Không thể tải tin nhắn support:", error);
      showError("Không thể tải nội dung trò chuyện");
    } finally {
      setIsLoading(false);
    }
  };

  // Admin gửi bằng HTTP; Socket chỉ giúp các màn hình khác cập nhật realtime.
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !selectedConversation || isSending) return;

    setInputText("");
    setIsSending(true);
    try {
      const response = await ChatService.sendAdminSupportMessage(
        selectedConversation._id,
        text
      );
      setMessages((current) => appendUnique(current, response.data.message));
      await fetchConversations();
    } catch (error) {
      console.error("Không thể gửi tin nhắn:", error);
      setInputText(text);
      showError("Gửi tin nhắn thất bại");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderLastMessage = (conversation) => {
    if (!conversation.lastMessage) {
      return <Text type="secondary">Chưa có tin nhắn</Text>;
    }

    const prefix =
      conversation.lastMessage.senderType === "admin" ? "Admin: " : "";
    return (
      <Text
        ellipsis
        type="secondary"
        style={{ fontWeight: conversation.unreadCount ? 600 : 400 }}
      >
        {prefix}{conversation.lastMessage.text}
      </Text>
    );
  };

  const customer = selectedConversation?.customer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="admin-page-header">
          <h1>Chăm sóc khách hàng</h1>
        </div>

        <ChatLayout>
          <ConversationList width={300} theme="light">
            <List
              itemLayout="horizontal"
              dataSource={conversations}
              locale={{ emptyText: "Chưa có yêu cầu hỗ trợ" }}
              renderItem={(conversation) => (
                <ConversationItem
                  isActive={selectedConversation?._id === conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={conversation.unreadCount} offset={[-5, 5]}>
                        <Avatar
                          src={conversation.customer?.avatar}
                          icon={<UserOutlined />}
                        />
                      </Badge>
                    }
                    title={
                      conversation.customer?.username ||
                      conversation.customer?.email ||
                      "Khách hàng"
                    }
                    description={renderLastMessage(conversation)}
                  />
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {new Date(conversation.updatedAt).toLocaleDateString("vi-VN")}
                  </Text>
                </ConversationItem>
              )}
            />
          </ConversationList>

          <ChatArea>
            {selectedConversation ? (
              <>
                <ChatHeader>
                  {customer?.username || customer?.email || "Khách hàng"}
                </ChatHeader>

                {contextMessages.length > 0 && (
                  <ContextPanel>
                    <Collapse
                      size="small"
                      items={[
                        {
                          key: "ai-context",
                          label: (
                            <span>
                              <RobotOutlined /> Ngữ cảnh chat AI gần nhất
                            </span>
                          ),
                          children: contextMessages.map((message) => (
                            <ContextMessage key={message._id}>
                              <strong>
                                {message.senderType === "bot" ? "AI" : "Khách"}:
                              </strong>{" "}
                              {message.text}
                            </ContextMessage>
                          )),
                        },
                      ]}
                    />
                  </ContextPanel>
                )}

                {isLoading ? (
                  <div style={{ margin: "auto" }}><Spin /></div>
                ) : (
                  <MessageContainer>
                    {messages.map((message) => {
                      const senderId =
                        typeof message.sender === "object"
                          ? message.sender?._id
                          : message.sender;
                      const isMine =
                        message.senderType === "admin" &&
                        String(senderId) === String(user.id);
                      const displayName =
                        message.senderType === "customer"
                          ? customer?.username || "Khách hàng"
                          : isMine
                          ? "Bạn"
                          : message.sender?.username
                          ? `Admin (${message.sender.username})`
                          : "Admin";

                      return (
                        <MessageBlock key={message._id} isMine={isMine}>
                          <SenderName>{displayName}</SenderName>
                          <MessageBubble isMine={isMine}>{message.text}</MessageBubble>
                        </MessageBlock>
                      );
                    })}
                    <div ref={scrollRef} />
                  </MessageContainer>
                )}

                <InputContainer>
                  <Input
                    size="large"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    onPressEnter={handleSend}
                    disabled={isSending}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    loading={isSending}
                    onClick={handleSend}
                  >
                    Gửi
                  </Button>
                </InputContainer>
              </>
            ) : (
              <div style={{ margin: "auto" }}>
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
