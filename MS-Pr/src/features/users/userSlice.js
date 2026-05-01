import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔽 GET USERS
export const fetchUsers = createAsyncThunk("users/fetch", async () => {
  const res = await axios.get("http://localhost:3000/users");
  return res.data;
});

// ➕ ADD USER
export const addUser = createAsyncThunk("users/add", async (user) => {
  const res = await axios.post("http://localhost:3000/users", user);
  return res.data;
});

// ❌ DELETE USER
export const deleteUser = createAsyncThunk("users/delete", async (id) => {
  await axios.delete(`http://localhost:3000/users/${id}`);
  return id;
});

// ✏️ UPDATE USER
export const updateUser = createAsyncThunk(
  "users/update",
  async (user) => {
    const res = await axios.put(
      `http://localhost:3000/users/${user.id}`,
      user
    );
    return res.data;
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: []
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(addUser.fulfilled, (state, action) => {
      state.list.push(action.payload);
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.list = state.list.filter(u => u.id !== action.payload);
    });


    builder.addCase(updateUser.fulfilled, (state, action) => {
  const index = state.list.findIndex(u => u.id === action.payload.id);
  if (index !== -1) {
    state.list[index] = action.payload;
  }
});
  }
});

export default userSlice.reducer;