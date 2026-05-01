import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ➕ Apply Leave
export const applyLeave = createAsyncThunk("leave/apply", async (leave) => {
  const res = await axios.post("http://localhost:3000/leaves", leave);
  return res.data;
});

// 🔽 Get Leaves
export const fetchLeaves = createAsyncThunk("leave/fetch", async () => {
  const res = await axios.get("http://localhost:3000/leaves");
  return res.data;
});

// ✏️ Update Leave Status
export const updateLeave = createAsyncThunk("leave/update", async (leave) => {
  const res = await axios.put(
    `http://localhost:3000/leaves/${leave.id}`,
    leave
  );
  return res.data;
});

const leaveSlice = createSlice({
  name: "leave",
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder.addCase(fetchLeaves.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(applyLeave.fulfilled, (state, action) => {
      state.list.push(action.payload);
    });
    builder.addCase(updateLeave.fulfilled, (state, action) => {
      const i = state.list.findIndex(l => l.id === action.payload.id);
      state.list[i] = action.payload;
    });
  }
});

export default leaveSlice.reducer;