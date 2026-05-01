import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:3001";

export const loginUser = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API}/users?email=${email}&password=${password}&status=active`);
    if (res.data.length === 0) throw new Error("Invalid credentials");
    const user = res.data[0];
    const { password: _, ...safeUser } = user;
    localStorage.setItem("hrms_user", JSON.stringify(safeUser));
    return safeUser;
  } catch (err) {
    return rejectWithValue(err.message || "Login failed");
  }
});

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem("hrms_user")); } catch { return null; }
})();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("hrms_user");
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
