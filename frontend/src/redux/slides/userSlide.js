import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "",
  email: "",
  access_token: "",
};

export const userSlide = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const { username, email, phone, access_token } = action.payload;
      console.log("action", action);
      state.username = username;
      state.email = email;
      state.phone = phone;
      state.access_token = access_token;

      //   state.email = action.payload.email;
      //   state.access_token = action.payload.access_token;
    },
    logoutUser: (state) => {
      state._id = null;
      state.email = "";
      state.username = "";
      state.phone = "";
      state.access_token = "";
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUser, logoutUser } = userSlide.actions;

export default userSlide.reducer;
