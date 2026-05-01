import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:3001";

export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  const res = await axios.get(`${API}/users`);
  return res.data.map(({ password, ...u }) => u);
});

export const createUser = createAsyncThunk("users/create", async (userData, { rejectWithValue }) => {
  try {
    const check = await axios.get(`${API}/users?email=${userData.email}`);
    if (check.data.length > 0) return rejectWithValue("Email already exists");
    const res = await axios.post(`${API}/users`, { ...userData, status: "active" });
    const { password, ...safe } = res.data;
    return safe;
  } catch (err) { return rejectWithValue(err.message); }
});

export const updateUser = createAsyncThunk("users/update", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`${API}/users/${id}`, data);
    const { password, ...safe } = res.data;
    return safe;
  } catch (err) { return rejectWithValue(err.message); }
});

export const deleteUser = createAsyncThunk("users/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API}/users/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.message); }
});

const usersSlice = createSlice({
  name: "users",
  initialState: { list: [], loading: false, error: null },
  reducers: { clearUsersError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => { s.loading = true; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createUser.fulfilled, (s, a) => { s.list.push(a.payload); })
      .addCase(createUser.rejected, (s, a) => { s.error = a.payload; })
      .addCase(updateUser.fulfilled, (s, a) => {
        const idx = s.list.findIndex(u => u.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.list = s.list.filter(u => u.id !== a.payload);
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
