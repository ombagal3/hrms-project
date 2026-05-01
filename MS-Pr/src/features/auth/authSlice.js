import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }) => {
    const res = await axios.get("http://localhost:3000/users");
    const user = res.data.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) throw new Error("Invalid credentials");
    return user;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state) => {
      state.error = "Login Failed";
    });



  }


});


export const { logout } = authSlice.actions;
export default authSlice.reducer;