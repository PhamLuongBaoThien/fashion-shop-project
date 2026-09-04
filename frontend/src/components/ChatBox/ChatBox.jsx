import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Card, Empty, Input, Spin, Tabs, Tooltip } from "antd";
import {
  CloseOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useMessageApi } from "../../context/MessageContext";
import * as ChatService from "../../services/ChatService";
import ButtonComponent from "../common/ButtonComponent/ButtonComponent";

const WrapperChat = styled.div`
  position: fixed;
  bottom: 45px;
  right: 20px;
  z-index: 1000;
`;

const ChatWindow = styled(Card)`
  width: 360px;
  height: 520px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
  border: none;

  .ant-card-head {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: white;
    min-height: 50px;
    border-bottom: none;
  }

  .ant-card-head-title {
    padding: 12px 0;
    color: white;
    font-size: 16px;
  }

  .ant-card-body {
    padding: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background-color: #f0f2f5;
  }

  .ant-tabs-nav {
    margin: 0;
    padding: 0 12px;
    background: #fff;
  }

  .ant-tabs-content-holder,
  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
    min-height: 0;
  }
`;

const ChatBody = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const MessageList = styled.div`
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isMine ? "flex-end" : "flex-start")};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  background-color: ${(props) => (props.isMine ? "#1890ff" : "#fff")};
  color: ${(props) => (props.isMine ? "#fff" : "#333")};
  border-bottom-right-radius: ${(props) => (props.isMine ? "4px" : "16px")};
  border-bottom-left-radius: ${(props) => (!props.isMine ? "4px" : "16px")};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  word-break: break-word;
  white-space: pre-wrap;
`;

const SenderName = styled.span`
  font-size: 11px;
  color: #999;
  margin: 0 8px 4px;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const InputArea = styled.div`
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const QuickRepliesContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #f9f9f9;
  overflow-x: auto;
  white-space: nowrap;
  border-top: 1px solid #f0f0f0;
`;

const SuggestionChip = styled.button`
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #1890ff;
    color: white;
  }
`;

// Cloudflare và local cùng dùng một tên biến; mỗi môi trường tự đặt giá trị phù hợp.
const ENDPOINT = process.env.REACT_APP_API_URL;

// HTTP response và Socket event có thể mang cùng một tin; lọc theo _id để tránh lặp.
const appendUnique = (messages, message) => {
  if (!message?._id) return messages;
  if (messages.some((item) => String(item._id) === String(message._id))) {
    return messages;
  }
  return [...messages, message];
};

// Biến URL sản phẩm do Gemini trả về thành link có thể nhấn.
const renderMessageText = (text, isMine) => {
  const value = String(text || "");
  const linkPattern = /(https?:\/\/[^\s]+|\/product\/[a-z0-9-]+)/gi;

  return value.split(linkPattern).map((part, index) => {
    linkPattern.lastIndex = 0;
    if (!linkPattern.test(part)) return part;

    const isExternal = part.startsWith("http");
    return (
      <a
        key={`${part}-${index}`}
        href={part}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        style={{
          color: isMine ? "#fff" : "#1677ff",
          textDecoration: "underline",
        }}
      >
        {part}
      </a>
    );
  });
};

const ChatBox = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { messageApi } = useMessageApi();
  const scrollRef = useRef(null);
  const activeTabRef = useRef("ai");
  const isOpenRef = useRef(false);
  const conversationIdsRef = useRef({ ai: null, support: null });

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState({ ai: [], support: [] });
  const [conversationIds, setConversationIds] = useState({
    ai: null,
    support: null,
  });
  const [unreadCounts, setUnreadCounts] = useState({ ai: 0, support: 0 });

  useEffect(() => {
    activeTabRef.current = activeTab;
    isOpenRef.current = isOpen;
    conversationIdsRef.current = conversationIds;
  }, [activeTab, isOpen, conversationIds]);

  useEffect(() => {
    if (!user?.id || !user?.access_token) return undefined;

    // Khi đăng nhập/reload, tải song song hai lịch sử và hai unread count riêng.
    const loadHistories = async () => {
      setIsLoading(true);
      try {
        const [aiResponse, supportResponse] = await Promise.all([
          ChatService.getAIMessages(),
          ChatService.getSupportMessages(),
        ]);

        setMessages({
          ai: aiResponse.data.messages || [],
          support: supportResponse.data.messages || [],
        });
        setConversationIds({
          ai: aiResponse.data.conversation?._id || null,
          support: supportResponse.data.conversation?._id || null,
        });
        setUnreadCounts({
          ai: aiResponse.data.unreadCount || 0,
          support: supportResponse.data.unreadCount || 0,
        });
      } catch (error) {
        console.error("Không thể tải lịch sử chat:", error);
        messageApi?.error("Không thể tải lịch sử chat");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistories();
  }, [messageApi, user?.access_token, user?.id]);

  useEffect(() => {
    if (!user?.id || !user?.access_token) return undefined;

    // Socket chỉ nhận cập nhật realtime; gửi tin vẫn dùng HTTP API ở handleSend.
    const socket = io(ENDPOINT, {
      path: "/socket.io/",
      transports: ["polling"],
      withCredentials: true,
      auth: { token: user.access_token },
    });

    socket.on("chat:message", ({ conversationId, conversationType, message }) => {
      if (!conversationType || !message) return;

      setMessages((current) => ({
        ...current,
        [conversationType]: appendUnique(current[conversationType] || [], message),
      }));
      setConversationIds((current) => ({
        ...current,
        [conversationType]: conversationId,
      }));

      const isViewing =
        isOpenRef.current && activeTabRef.current === conversationType;
      if (isViewing) {
        ChatService.markAsRead(conversationId).catch(() => {});
      } else {
        setUnreadCounts((current) => ({
          ...current,
          [conversationType]: (current[conversationType] || 0) + 1,
        }));
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });

    return () => socket.disconnect();
  }, [user?.access_token, user?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const conversationId = conversationIds[activeTab];
    setUnreadCounts((current) => ({ ...current, [activeTab]: 0 }));
    if (conversationId) ChatService.markAsRead(conversationId).catch(() => {});
  }, [activeTab, conversationIds, isOpen]);

  useEffect(() => {
    if (isOpen) scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTab, isOpen, messages]);

  const visibleMessages = useMemo(() => messages[activeTab] || [], [activeTab, messages]);
  const totalUnread = unreadCounts.ai + unreadCounts.support;

  // Endpoint gửi được chọn theo tab; conversation chỉ được tạo ở tin đầu tiên.
  const handleSend = async (customText) => {
    const text = typeof customText === "string" ? customText : inputText;
    if (!text.trim() || isSending) return;

    setInputText("");
    setIsSending(true);
    try {
      const response =
        activeTab === "ai"
          ? await ChatService.sendAIMessage(text.trim())
          : await ChatService.sendSupportMessage(text.trim());
      const { conversation, message } = response.data;

      setMessages((current) => ({
        ...current,
        [activeTab]: appendUnique(current[activeTab], message),
      }));
      setConversationIds((current) => ({
        ...current,
        [activeTab]: conversation._id,
      }));
    } catch (error) {
      console.error("Không thể gửi tin nhắn:", error);
      setInputText(text);
      messageApi?.error("Gửi tin nhắn thất bại");
    } finally {
      setIsSending(false);
    }
  };

  const handleToggle = () => {
    if (!user?.id) {
      messageApi?.warning("Vui lòng đăng nhập để sử dụng chat");
      navigate("/sign-in", { state: window.location.pathname });
      return;
    }
    setIsOpen((current) => !current);
  };

  const renderMessages = () => {
    if (isLoading) {
      return (
        <EmptyState>
          <Spin />
        </EmptyState>
      );
    }

    if (visibleMessages.length === 0) {
      return (
        <EmptyState>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeTab === "ai"
                ? "Hãy hỏi AI về sản phẩm bạn đang tìm"
                : "Hãy mô tả vấn đề để nhân viên hỗ trợ"
            }
          />
        </EmptyState>
      );
    }

    return (
      <MessageList>
        {visibleMessages.map((item) => {
          const senderId =
            typeof item.sender === "object" ? item.sender?._id : item.sender;
          const isMine =
            item.senderType === "customer" && String(senderId) === String(user.id);
          const displayName =
            item.senderType === "bot"
              ? "Trợ lý AI"
              : item.senderType === "admin"
              ? item.sender?.username
                ? `Admin (${item.sender.username})`
                : "Nhân viên hỗ trợ"
              : item.senderType === "system"
              ? "Hệ thống"
              : "Bạn";

          return (
            <MessageGroup key={item._id} isMine={isMine}>
              {!isMine && <SenderName>{displayName}</SenderName>}
              <MessageBubble isMine={isMine}>
                {renderMessageText(item.text, isMine)}
              </MessageBubble>
            </MessageGroup>
          );
        })}
        <div ref={scrollRef} />
      </MessageList>
    );
  };

  const chatContent = (
    <ChatBody>
      {renderMessages()}
      {activeTab === "ai" && (
        <QuickRepliesContainer>
          <SuggestionChip onClick={() => handleSend("Gợi ý cho tôi sản phẩm mới") }>
            Sản phẩm mới
          </SuggestionChip>
          <SuggestionChip onClick={() => handleSend("Gợi ý sản phẩm dưới 500k") }>
            Dưới 500k
          </SuggestionChip>
          <SuggestionChip onClick={() => setActiveTab("support") }>
            Gặp nhân viên
          </SuggestionChip>
        </QuickRepliesContainer>
      )}
      <InputArea>
        <Input
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onPressEnter={() => handleSend()}
          placeholder={
            activeTab === "ai"
              ? "Hỏi AI về sản phẩm..."
              : "Nhập nội dung cần hỗ trợ..."
          }
          disabled={isSending}
          bordered={false}
          style={{ backgroundColor: "#f5f5f5", borderRadius: 20, paddingLeft: 15 }}
        />
        <ButtonComponent
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          loading={isSending}
          onClick={() => handleSend()}
        />
      </InputArea>
    </ChatBody>
  );

  const tabItems = [
    {
      key: "ai",
      label: (
        <Badge size="small" count={unreadCounts.ai} offset={[8, -2]}>
          <span><RobotOutlined /> Trợ lý AI</span>
        </Badge>
      ),
      children: chatContent,
    },
    {
      key: "support",
      label: (
        <Badge size="small" count={unreadCounts.support} offset={[8, -2]}>
          <span><CustomerServiceOutlined /> Nhân viên</span>
        </Badge>
      ),
      children: chatContent,
    },
  ];

  return (
    <WrapperChat>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ position: "absolute", bottom: 80, right: 0 }}
          >
            <ChatWindow
              title="Hỗ trợ khách hàng"
              extra={
                <CloseOutlined
                  onClick={() => setIsOpen(false)}
                  style={{ cursor: "pointer", color: "white" }}
                />
              }
              size="small"
              bordered={false}
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ flex: 1, minHeight: 0 }}
              />
            </ChatWindow>
          </motion.div>
        )}
      </AnimatePresence>

      <Tooltip title="Chat ngay" placement="left">
        <Badge count={totalUnread} overflowCount={99}>
          <ButtonComponent
            type="primary"
            shape="circle"
            icon={isOpen ? <CloseOutlined /> : <MessageOutlined />}
            size="large"
            style={{
              width: 60,
              height: 60,
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
              fontSize: 24,
            }}
            onClick={handleToggle}
          />
        </Badge>
      </Tooltip>
    </WrapperChat>
  );
};

export default ChatBox;
