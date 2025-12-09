import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Card, Avatar, Tooltip, Badge } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMessageApi } from "../../context/MessageContext";
import * as ChatService from "../../services/ChatService";
import { motion, AnimatePresence } from "framer-motion";

const WrapperChat = styled.div`
  position: fixed;
  bottom: 45px;
  right: 20px;
  z-index: 1000;
`;

const ChatWindow = styled(Card)`
  width: 340px;
  height: 480px;
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
    display: flex;
    flex-direction: column;
    height: calc(100% - 50px); // Trừ header
    background-color: #f0f2f5;
  }
`;

const MessageList = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
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
  margin-bottom: 4px;
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  background-color: ${(props) => (props.isMine ? "#1890ff" : "#fff")};
  color: ${(props) => (props.isMine ? "#fff" : "#333")};
  border-bottom-right-radius: ${(props) => (props.isMine ? "4px" : "16px")};
  border-bottom-left-radius: ${(props) => (!props.isMine ? "4px" : "16px")};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  word-break: break-word;
`;

const SenderName = styled.span`
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
  margin-left: 8px;
  margin-right: 8px;
`;

const InputArea = styled.div`
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ENDPOINT = process.env.REACT_APP_NODE_ENV === 'production' ?
  process.env.REACT_APP_API_URL_PROD :
  process.env.REACT_APP_API_URL;

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // Đếm tin chưa đọc
  const [conversationId, setConversationId] = useState(null); // Lưu ID hội thoại

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { messageApi } = useMessageApi();
  const scrollRef = useRef();

  // 1. LOGIC SOCKET (Giữ nguyên)
  useEffect(() => {
    if (user?.id) {
      const newSocket = io(ENDPOINT); 
      setSocket(newSocket);
      newSocket.emit("join_chat", user.id); // Tham gia phòng chat

      newSocket.on("new_message", (data) => {
        if (data.sender !== user.id || data.senderType === 'bot' || data.senderType === 'admin') { // nếu tin nhắn không phải do mình gửi hoặc là từ bot/admin sẽ hiển thị ngay
          setMessages((prev) => [...prev, data]); // prev là tin cũ, data là tin mới

          // LOGIC BADGE: Nếu chat đang đóng thì tăng số
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1); // prev là số hiện tại
          }
        }
      });

      return () => newSocket.disconnect();
    }
  }, [user?.id, isOpen]); // Chỉ chạy lại khi user.id hoặc isOpen thay đổi

  // 2. LẤY LỊCH SỬ + CHECK NGÀY MỚI
  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.id) {
        try {
          const res = await ChatService.getMessages();
          if (res?.status === "OK") {
            let historyMessages = res.data || []; 

            // Lấy conversationId từ tin nhắn đầu tiên (nếu có) để dùng cho markAsRead
            if (historyMessages.length > 0) {
              setConversationId(historyMessages[0].conversationId);
            }

             // Đếm số tin nhắn có isRead = false VÀ sender không phải mình
            const unread = historyMessages.filter(msg => {
                const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                return !msg.isRead && senderId !== user.id;
            }).length;
            
            // Nếu Chat đang mở thì coi như đã đọc hết (0), nếu đóng thì set số unread
            if (!isOpen) {
                setUnreadCount(unread);
            }

            const today = new Date().toDateString();
            const lastMsg =
              historyMessages.length > 0
                ? historyMessages[historyMessages.length - 1]
                : null;
            const lastMsgDate = lastMsg
              ? new Date(lastMsg.createdAt).toDateString()
              : null;

            if (!lastMsg || lastMsgDate !== today) {
              const welcomeMsg = {
                _id: `welcome_msg_${Date.now()}`,
                text: `Xin chào ${
                  user.username || user.name || "bạn"
                }! Chúng tôi có thể giúp gì cho bạn hôm nay?`,
                senderType: "bot",
                sender: { username: "Trợ lý ảo" },
                createdAt: new Date().toISOString(),
              };
              historyMessages = [...historyMessages, welcomeMsg];
            }
            setMessages(historyMessages);
          }
        } catch (error) {
          console.error("Lỗi tải lịch sử chat:", error);
        }
      }
    };

    if (user?.id) fetchHistory(); // chỉ fetch khi có user
  }, [user?.id, user?.name, user?.username]); // bỏ isOpen ra vì chỉ chạy 1 lần khi load trang

  // XỬ LÝ KHI MỞ KHUNG CHAT -> RESET BADGE & MARK READ
  useEffect(() => {
    if (isOpen && conversationId) {
      setUnreadCount(0); // Reset badge hiển thị
      // Gọi API báo Server là đã đọc
      ChatService.markAsRead(conversationId);
    }
  }, [isOpen, conversationId]);

  // 3. AUTO SCROLL
useEffect(() => {
    if (isOpen) { // Chỉ scroll khi chat mở
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // 4. HANDLER GỬI
  const handleSend = async () => {
    if (!message.trim()) return;

    const msgData = {
      senderId: user.id,
      receiverId: "ADMIN", // Server sẽ xử lý "ADMIN" thành ID thực
      text: message,
      senderType: "customer", 
    };

    // Optimistic Update 
    const tempMsg = { ...msgData, sender: user.id, _id: Date.now() }; // Để hiển thị ngay không cần chờ server trả về
    setMessages((prev) => [...prev, tempMsg]);
    setMessage("");

    try {
      const res = await ChatService.createMessage(msgData);
      if (res?.status !== "OK") {
        console.error("Gửi tin thất bại" || res?.message );
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  const handleToggleChat = () => {
    if (!user?.id) {
      if (messageApi) messageApi.warning("Vui lòng đăng nhập để chat!");
      navigate("/sign-in", { state: window.location.pathname });
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <WrapperChat>
      {/* Bao AnimatePresence ngoài để có hiệu ứng đóng */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window" // Key là bắt buộc đối với AnimatePresence
            initial={{ opacity: 0, y: 20, scale: 0.95 }} // Trạng thái bắt đầu
            animate={{ opacity: 1, y: 0, scale: 1 }} // Trạng thái hiển thị
            exit={{ opacity: 0, y: 20, scale: 0.95 }} // Trạng thái khi đóng
            transition={{
              type: "spring", // lò xo
              stiffness: 260, // Độ cứng (càng cao càng bật nhanh)
              damping: 20, // Độ cản (càng thấp càng rung lắc nhiều)
            }}
            style={{
              position: "absolute",
              bottom: "80px",
              right: 0,
              zIndex: 1000, // Đảm bảo nổi lên trên
              transformOrigin: "bottom right", // Để nó phóng to từ góc dưới bên phải lên
            }}
          >
            <ChatWindow
              title={
                <span>
                  <RobotOutlined style={{ marginRight: 8 }} /> Hỗ trợ khách hàng
                </span>
              }
              extra={
                <CloseOutlined
                  onClick={() => setIsOpen(false)}
                  style={{
                    cursor: "pointer",
                    color: "white",
                    fontSize: "16px",
                  }}
                />
              }
              size="small"
              bordered={false}
            >
              <MessageList>
                {messages.map((msg, i) => {
                  // QUAN TRỌNG: Bot và Admin đều hiện bên trái
                  const isMine = msg.senderType === "customer" && 
                                (typeof msg.sender === "object" ? msg.sender._id : msg.sender) === user.id;

                  const displayName = 
                    msg.senderType === "bot" ? "Trợ lý ảo AI" :
                    msg.senderType === "admin" ? 
                      (typeof msg.sender === "object" && msg.sender.username ? `Admin (${msg.sender.username})` : "Admin") :
                    "Bạn";

                  return (
                    <MessageGroup key={i} isMine={isMine}>
                      {!isMine && <SenderName>{displayName}</SenderName>}
                      <MessageBubble isMine={isMine}>{msg.text}</MessageBubble>
                    </MessageGroup>
                  );
                })}
                <div ref={scrollRef} />
              </MessageList>

              <InputArea>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onPressEnter={handleSend}
                  placeholder="Nhập tin nhắn..."
                  bordered={false}
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: 20,
                    paddingLeft: 15,
                  }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  style={{ marginLeft: 8 }}
                />
              </InputArea>
            </ChatWindow>
          </motion.div>
        )}

        <Tooltip title="Chat ngay" placement="left">
          <Badge count={unreadCount} overflowCount={99}>
            <Button
              type="primary"
              shape="circle"
              icon={isOpen ? <CloseOutlined /> : <MessageOutlined />}
              size="large"
              style={{
                width: 60,
                height: 60,
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "24px",
              }}
              onClick={handleToggleChat}
            />
          </Badge>
        </Tooltip>
      </AnimatePresence>
    </WrapperChat>
  );
};

export default ChatBox;
