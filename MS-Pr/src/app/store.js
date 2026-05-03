import { configureStore } from "@reduxjs/toolkit";
import attendanceReducer from "../features/attendance/attendanceSlice";
import authReducer from "../features/auth/authSlice";
import leaveReducer from "../features/leave/leaveSlice";
import userReducer from "../features/users/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    leave: leaveReducer,
    attendance: attendanceReducer
  }
});
