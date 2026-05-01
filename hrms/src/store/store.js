import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import attendanceReducer from "./slices/attendanceSlice";
import leavesReducer from "./slices/leavesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    attendance: attendanceReducer,
    leaves: leavesReducer,
  },
});
