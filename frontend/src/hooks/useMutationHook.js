import { useMutation } from "@tanstack/react-query";

export const useMutationHooks = (fnCallback) => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await fnCallback(data);
      // Nếu UserService trả về axios response, lấy phần .data
      return res?.data || res; 
    },
  });
};
