import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:3001";

export const fetchLeaves = createAsyncThunk("leaves/fetchAll", async () => {
  const res = await axios.get(`${API}/leaves`);
  return res.data;
});

export const fetchUserLeaves = createAsyncThunk("leaves/fetchUser", async (userId) => {
  const res = await axios.get(`${API}/leaves?userId=${userId}`);
  return res.data;
});

export const applyLeave = createAsyncThunk("leaves/apply", async (leaveData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API}/leaves`, { ...leaveData, status: "pending" });
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const updateLeaveStatus = createAsyncThunk("leaves/updateStatus", async ({ id, status }) => {
  const res = await axios.patch(`${API}/leaves/${id}`, { status });
  return res.data;
});

const leavesSlice = createSlice({
  name: "leaves",
  initialState: { records: [], loading: false, error: null, success: null },
  reducers: { clearLeavesMsg: (s) => { s.error = null; s.success = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.fulfilled, (s, a) => { s.records = a.payload; })
      .addCase(fetchUserLeaves.fulfilled, (s, a) => { s.records = a.payload; })
      .addCase(applyLeave.pending, (s) => { s.loading = true; })
      .addCase(applyLeave.fulfilled, (s, a) => {
        s.loading = false; s.records.push(a.payload);
        s.success = "Leave applied successfully";
      })
      .addCase(applyLeave.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateLeaveStatus.fulfilled, (s, a) => {
        const idx = s.records.findIndex(r => r.id === a.payload.id);
        if (idx !== -1) s.records[idx] = a.payload;
      });
  },
});

export const { clearLeavesMsg } = leavesSlice.actions;
export default leavesSlice.reducer;
