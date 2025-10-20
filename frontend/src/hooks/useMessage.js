import { useCallback, useMemo } from "react";
import { message } from "antd";

export const useMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  // Ghi nhớ hàm - tránh tạo mới mỗi lần re-render
  const showSuccess = useCallback(
    (content, duration = 2) => {
      messageApi.open({ type: "success", content, duration });
    },
    [messageApi]
  );

  const showError = useCallback(
    (content, duration = 3) => {
      messageApi.open({ type: "error", content, duration });
    },
    [messageApi]
  );

  const showWarning = useCallback(
    (content, duration = 3) => {
      messageApi.open({ type: "warning", content, duration });
    },
    [messageApi]
  );

  // Gộp lại thành object memoized (tránh object mới mỗi render)
  const messageHandlers = useMemo(
    () => ({
      showSuccess,
      showError,
      showWarning,
    }),
    [showSuccess, showError, showWarning]
  );

  return {
    messageApi,
    contextHolder,
    ...messageHandlers,
  };
};

//useCallback: showSuccess sẽ giữ nguyên tham chiếu qua các lần render, chỉ tạo mới lại khi messageApi thay đổi
//useMemo: messageHandlers sẽ giữ nguyên tham chiếu qua các lần render, chỉ tạo mới lại khi showSuccess, showError, hoặc showWarning thay đổi