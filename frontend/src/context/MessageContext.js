import React, { createContext, useContext, useMemo, useCallback } from "react";
import { message } from "antd";

// 1. Tạo Context
const MessageContext = createContext(null);

// 2. Provider
export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  // Thiết lập thời gian hiển thị mặc định theo loại
  const defaultDurations = {
    success: 2,
    error: 3,
    warning: 3,
    info: 2,
    loading: 0, // giữ vô thời hạn cho tới khi bị ghi đè
  };

  // Hàm dùng chung để hiển thị message có key & duration
  const showMessage = useCallback(
    (type, content, key, duration) => {
      messageApi.open({
        type,
        content,
        key,
        duration: duration ?? defaultDurations[type],
      });
    },
    [messageApi]
  );

  // Các hàm tiện ích cụ thể cho từng loại
  const showSuccess = useCallback(
    (content, key, duration) => showMessage("success", content, key, duration),
    [showMessage]
  );

  const showError = useCallback(
    (content, key, duration) => showMessage("error", content, key, duration),
    [showMessage]
  );

  const showWarning = useCallback(
    (content, key, duration) => showMessage("warning", content, key, duration),
    [showMessage]
  );

  const showInfo = useCallback(
    (content, key, duration) => showMessage("info", content, key, duration),
    [showMessage]
  );

  const showLoading = useCallback(
    (content, key, duration) => showMessage("loading", content, key, duration),
    [showMessage]
  );

  // Gộp tất cả hàm vào 1 object
  const value = useMemo(
    () => ({
      messageApi,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showLoading,
    }),
    [messageApi, showSuccess, showError, showWarning, showInfo, showLoading]
  );

  return (
    <MessageContext.Provider value={value}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

// 7. Hook tiện dụng
export const useMessageApi = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageApi phải được dùng bên trong MessageProvider");
  }
  return context;
};
