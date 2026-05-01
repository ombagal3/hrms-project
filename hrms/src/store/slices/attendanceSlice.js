import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getCurrentTime, todayStr } from "../../utils/salaryUtils";

const API = "http://localhost:3001";

export const fetchAttendance = createAsyncThunk("attendance/fetchAll", async () => {
  const res = await axios.get(`${API}/attendance`);
  return res.data;
});

export const fetchUserAttendance = createAsyncThunk("attendance/fetchUser", async (userId) => {
  const res = await axios.get(`${API}/attendance?userId=${userId}`);
  return res.data;
});

export const checkIn = createAsyncThunk("attendance/checkIn", async (userId, { rejectWithValue }) => {
  try {
    const today = todayStr();
    const existing = await axios.get(`${API}/attendance?userId=${userId}&date=${today}`);
    if (existing.data.length > 0) return rejectWithValue("Already checked in today");
    const record = { userId, date: today, checkIn: getCurrentTime(), checkOut: null };
    const res = await axios.post(`${API}/attendance`, record);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const checkOut = createAsyncThunk("attendance/checkOut", async (userId, { rejectWithValue }) => {
  try {
    const today = todayStr();
    const existing = await axios.get(`${API}/attendance?userId=${userId}&date=${today}`);
    if (existing.data.length === 0) return rejectWithValue("No check-in found for today");
    const record = existing.data[0];
    if (record.checkOut) return rejectWithValue("Already checked out");
    const res = await axios.patch(`${API}/attendance/${record.id}`, { checkOut: getCurrentTime() });
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: { records: [], loading: false, error: null, success: null },
  reducers: {
    clearAttendanceMsg: (s) => { s.error = null; s.success = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.fulfilled, (s, a) => { s.records = a.payload; })
      .addCase(fetchUserAttendance.fulfilled, (s, a) => { s.records = a.payload; })
      .addCase(checkIn.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(checkIn.fulfilled, (s, a) => {
        s.loading = false; s.records.push(a.payload);
        s.success = `Checked in at ${a.payload.checkIn}`;
      })
      .addCase(checkIn.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(checkOut.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(checkOut.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.records.findIndex(r => r.id === a.payload.id);
        if (idx !== -1) s.records[idx] = a.payload;
        s.success = `Checked out at ${a.payload.checkOut}`;
      })
      .addCase(checkOut.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearAttendanceMsg } = attendanceSlice.actions;
export default attendanceSlice.reducer;
