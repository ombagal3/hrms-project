import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import leaveReducer from "../features/leave/leaveSlice";
import attendanceReducer from "../features/attendance/attendanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer, // ✅ yaha add kiya
    leave: leaveReducer,
    attendance: attendanceReducer
  }
});