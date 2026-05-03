import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const markAttendance = createAsyncThunk(
  "attendance/add",
  async (data) => {
    const res = await axios.post("http://localhost:3000/attendance", data);
    return res.data;
  }
);

export const updateAttendance = createAsyncThunk(
  "attendance/update",
  async (data) => {
    const res = await axios.put(
      `http://localhost:3000/attendance/${data.id}`,
      data
    );
    return res.data;
  }
);

export const fetchAttendance = createAsyncThunk(
  "attendance/fetch",
  async () => {
    const res = await axios.get("http://localhost:3000/attendance");
    return res.data;
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder.addCase(fetchAttendance.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(markAttendance.fulfilled, (state, action) => {
      state.list.push(action.payload);
    });
    builder.addCase(updateAttendance.fulfilled, (state, action) => {
      const index = state.list.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    });
  }
});

export default attendanceSlice.reducer;
