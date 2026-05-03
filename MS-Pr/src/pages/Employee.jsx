import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttendance,
  markAttendance,
  updateAttendance
} from "../features/attendance/attendanceSlice";
import { applyLeave, fetchLeaves } from "../features/leave/leaveSlice";
import { fetchUsers } from "../features/users/userSlice";

const normalHours = 8;
const monthlyWorkDays = 26;
const monthlyWorkHours = normalHours * monthlyWorkDays;

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

const roundMoney = (value) => Math.round(value * 100) / 100;

export default function Employee() {
  const dispatch = useDispatch();

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("attendance");
  const [now, setNow] = useState(new Date());

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const attendance = useSelector((state) => state.attendance.list);
  const leaves = useSelector((state) => state.leave.list);
  const users = useSelector((state) => state.users.list);

  const user = useMemo(() => {
    return (
      users.find((item) => item.id === savedUser?.id) ||
      users.find((item) => item.email === savedUser?.email) ||
      savedUser
    );
  }, [savedUser, users]);

  useEffect(() => {
    dispatch(fetchAttendance());
    dispatch(fetchLeaves());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = getToday();

  const myLeaves = useMemo(() => {
    return leaves.filter((leave) => leave.name === user?.name);
  }, [leaves, user?.name]);

  const myAttendance = useMemo(() => {
    return attendance.filter(
      (item) =>
        item.userId === user?.id ||
        item.email === user?.email ||
        item.name === user?.name
    );
  }, [attendance, user?.email, user?.id, user?.name]);

  const todayAttendance = myAttendance.find((item) => item.date === today);
  const activeAttendance = myAttendance.find(
    (item) => item.date === today && !item.checkOutAt
  );

  if (!user) {
    return <h3>Please login again</h3>;
  }

  const monthlySalary = Number(user.monthlySalary || user.salary || 0);
  const hourlySalary = monthlySalary ? monthlySalary / monthlyWorkHours : 0;
  const totalLeaves = myLeaves.length;
  const pendingLeaves = myLeaves.filter((l) => l.status === "pending").length;
  const approvedLeaves = myLeaves.filter((l) => l.status === "approved").length;

  const handleApply = () => {
    if (!date || !reason.trim()) {
      alert("Leave date and reason required");
      return;
    }

    dispatch(
      applyLeave({
        name: user.name,
        date,
        reason,
        status: "pending"
      })
    );
    setDate("");
    setReason("");
  };

  const handleAttendance = () => {
    if (!monthlySalary) {
      alert("Monthly salary admin panel me set karo");
      return;
    }

    const currentTime = new Date();

    if (!activeAttendance) {
      if (todayAttendance) {
        alert("Today attendance already completed");
        return;
      }

      dispatch(
        markAttendance({
          userId: user.id,
          name: user.name,
          email: user.email,
          date: today,
          checkIn: currentTime.toLocaleTimeString(),
          checkInAt: currentTime.toISOString(),
          checkOut: "",
          checkOutAt: "",
          normalHours,
          monthlySalary,
          hourlySalary,
          workedHours: 0,
          overtimeHours: 0,
          salaryAmount: 0,
          status: "checked-in"
        })
      );
      return;
    }

    const checkInTime = new Date(activeAttendance.checkInAt);
    const workedHours = Math.max(
      0,
      (currentTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
    );
    const overtimeHours = Math.max(0, workedHours - normalHours);
    const salaryAmount = roundMoney(workedHours * hourlySalary);

    dispatch(
      updateAttendance({
        ...activeAttendance,
        checkOut: currentTime.toLocaleTimeString(),
        checkOutAt: currentTime.toISOString(),
        workedHours: roundMoney(workedHours),
        overtimeHours: roundMoney(overtimeHours),
        salaryAmount,
        status: "completed"
      })
    );
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Employee Dashboard</h2>
            <p>{user.name} salary and attendance</p>
          </div>
          <span className="clock">{now.toLocaleTimeString()}</span>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span>Monthly Salary</span>
            <strong>Rs {monthlySalary || 0}</strong>
          </div>
          <div className="stat-card">
            <span>Hourly Rate</span>
            <strong>Rs {roundMoney(hourlySalary)}</strong>
          </div>
          <div className="stat-card">
            <span>Month Hours</span>
            <strong>{monthlyWorkHours} hr</strong>
          </div>
          <div className="stat-card">
            <span>Today Status</span>
            <strong>
              {activeAttendance
                ? "Checked In"
                : todayAttendance?.checkOutAt
                ? "Completed"
                : "Not Started"}
            </strong>
          </div>
          <div className="stat-card">
            <span>Today Salary</span>
            <strong>Rs {todayAttendance?.salaryAmount || 0}</strong>
          </div>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "attendance" ? "active-tab" : ""}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>
          <button
            className={activeTab === "leave" ? "active-tab" : ""}
            onClick={() => setActiveTab("leave")}
          >
            Leave
          </button>
        </div>

        {activeTab === "attendance" && (
          <div className="attendance-box">
            <button className="attendance-btn" onClick={handleAttendance}>
              {activeAttendance ? "Check Out" : "Check In"}
            </button>

            <div className="attendance-details">
              <div>
                <span>Check In</span>
                <strong>{formatTime(todayAttendance?.checkInAt)}</strong>
              </div>
              <div>
                <span>Check Out</span>
                <strong>{formatTime(todayAttendance?.checkOutAt)}</strong>
              </div>
              <div>
                <span>Worked Hours</span>
                <strong>{todayAttendance?.workedHours || 0} hr</strong>
              </div>
              <div>
                <span>Overtime</span>
                <strong>{todayAttendance?.overtimeHours || 0} hr</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="leave-box">
            <div className="employee-form two-column">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <button className="primary-btn" onClick={handleApply}>
              Apply Leave
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="stat-grid">
          <div className="stat-card">
            <span>Total Leaves</span>
            <strong>{totalLeaves}</strong>
          </div>
          <div className="stat-card">
            <span>Pending</span>
            <strong>{pendingLeaves}</strong>
          </div>
          <div className="stat-card">
            <span>Approved</span>
            <strong>{approvedLeaves}</strong>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Overtime</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>
              {myAttendance.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{formatTime(item.checkInAt)}</td>
                  <td>{formatTime(item.checkOutAt)}</td>
                  <td>{item.workedHours || 0}</td>
                  <td>{item.overtimeHours || 0}</td>
                  <td>Rs {item.salaryAmount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
