import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  username: "",
  email: "",
  access_token: "",
  phone: "",
  address: "",
  avatar: "",
  gender: "",
  createdAt: "",
  dateOfBirth: null,
  isAdmin: false,
  role: "",
};

export const userSlide = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const {
        username,
        email,
        phone,
        address = "",
        avatar = "",
        _id,
        createdAt,
        access_token,
        gender = "",
        dateOfBirth = null,
        isAdmin,
        role,
      } = action.payload;
      // console.log("action", action);
      state.id = _id;
      state.username = username;
      state.email = email;
      state.phone = phone;
      state.address = address;
      state.avatar = avatar;
      state.gender = gender;
      state.dateOfBirth = dateOfBirth;
      state.createdAt = createdAt;
      state.access_token = access_token;
      state.isAdmin = isAdmin;
      state.role = role ? (typeof role === 'object' ? role._id : role) : ""; 

      //   state.email = action.payload.email;
      //   state.access_token = action.payload.access_token;
    },
    resetUser: (state) => {
      state.id = "";
      state.email = "";
      state.username = "";
      state.phone = "";
      state.address = "";
      state.avatar = "";
      state.dateOfBirth = null;
      state.createdAt = "";
      state.access_token = "";
      state.isAdmin = false;
      state.role = ""; 
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlide.actions;

export default userSlide.reducer;
