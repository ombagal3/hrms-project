import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { fetchUsers } from "../../store/slices/usersSlice";
import { fetchAttendance } from "../../store/slices/attendanceSlice";
import { fetchLeaves, updateLeaveStatus } from "../../store/slices/leavesSlice";
import AttendanceWidget from "../../components/AttendanceWidget";
import AttendanceCalendar from "../../components/AttendanceCalendar";
import SalaryCard from "../../components/SalaryCard";

const NAV = [
  { icon: "grid-1x2", label: "Dashboard", path: "/manager" },
  { icon: "people", label: "My Team", path: "/manager/team" },
  { icon: "calendar-check", label: "Attendance", path: "/manager/attendance" },
  { icon: "calendar2-x", label: "Leaves", path: "/manager/leaves" },
];

export default function ManagerDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar navItems={NAV} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<ManagerHome />} />
          <Route path="/team" element={<TeamView />} />
          <Route path="/attendance" element={<ManagerAttendance />} />
          <Route path="/leaves" element={<ManagerLeaves />} />
        </Routes>
      </div>
    </div>
  );
}

function ManagerHome() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { list: users } = useSelector(s => s.users);
  const { records: attendance } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchAttendance()); dispatch(fetchLeaves()); }, [dispatch]);

  const employees = users.filter(u => u.role === "employee");
  const today = new Date().toISOString().split("T")[0];
  const presentToday = attendance.filter(a => a.date === today && a.checkIn).length;
  const pendingLeaves = leaves.filter(l => l.status === "pending").length;

  return (
    <>
      <Topbar title="Manager Dashboard" />
      <div className="page-content">
        <div className="mb-4">
          <h5 style={{ fontWeight: 700 }}>Hello, {user?.name} 👋</h5>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Manage your team's attendance and leaves.</p>
        </div>

        <div className="row g-3 mb-4">
          {[
            { label: "Team Members", value: employees.length, icon: "people-fill", color: "var(--accent)" },
            { label: "Present Today", value: presentToday, icon: "check-circle-fill", color: "var(--success)" },
            { label: "Pending Leaves", value: pendingLeaves, icon: "hourglass-split", color: "var(--warning)" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="col-md-4">
              <div className="stat-card accent">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="stat-value" style={{ color }}>{value}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                  <div className="stat-icon" style={{ background: `${color}15`, color }}>
                    <i className={`bi bi-${icon}`}></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <AttendanceWidget userId={user?.id} />
          </div>
          <div className="col-md-6">
            <div className="hrms-card">
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>My Salary</div>
              <SalaryCard userId={user?.id} hourlyRate={user?.salary || 0} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TeamView() {
  const dispatch = useDispatch();
  const { list: users } = useSelector(s => s.users);
  const { records: attendance } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);
  const [selUser, setSelUser] = useState(null);
  const [view, setView] = useState("attendance");

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchAttendance()); dispatch(fetchLeaves()); }, [dispatch]);

  const employees = users.filter(u => u.role === "employee");
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Topbar title="My Team" />
      <div className="page-content">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="hrms-card">
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>Team ({employees.length})</div>
              {employees.map(emp => {
                const todayAtt = attendance.find(a => a.date === today && a.userId === emp.id);
                const isPresent = !!todayAtt?.checkIn;
                return (
                  <div key={emp.id} onClick={() => setSelUser(selUser?.id === emp.id ? null : emp)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 10px", borderRadius: 8, cursor: "pointer", background: selUser?.id === emp.id ? "rgba(79,125,243,0.1)" : "transparent", marginBottom: 4 }}>
                    <div className="avatar" style={{ position: "relative" }}>
                      {emp.avatar}
                      <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: isPresent ? "var(--success)" : "var(--text-muted)", border: "2px solid var(--card-bg)" }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{emp.designation}</div>
                    </div>
                    <div style={{ fontSize: 11, color: isPresent ? "var(--success)" : "var(--text-muted)" }}>
                      {isPresent ? todayAtt.checkIn : "Absent"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-md-8">
            {selUser ? (
              <div className="hrms-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                  <div className="avatar avatar-lg">{selUser.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{selUser.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{selUser.designation} · {selUser.department}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className={`btn-hrms ${view === "attendance" ? "btn-primary-hrms" : "btn-outline-hrms"}`} style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setView("attendance")}>Attendance</button>
                    <button className={`btn-hrms ${view === "salary" ? "btn-primary-hrms" : "btn-outline-hrms"}`} style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setView("salary")}>Salary</button>
                  </div>
                </div>
                {view === "attendance" ? (
                  <AttendanceCalendar records={attendance} leaves={leaves} userId={selUser.id} />
                ) : (
                  <SalaryCard userId={selUser.id} hourlyRate={selUser.salary || 0} />
                )}
              </div>
            ) : (
              <div className="hrms-card" style={{ textAlign: "center", padding: 48 }}>
                <i className="bi bi-person-check" style={{ fontSize: 48, color: "var(--text-muted)", display: "block", marginBottom: 12 }}></i>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Click a team member to view details</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ManagerAttendance() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { records } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);
  useEffect(() => { dispatch(fetchAttendance()); dispatch(fetchLeaves()); }, [dispatch]);

  return (
    <>
      <Topbar title="My Attendance" />
      <div className="page-content">
        <div className="row g-3">
          <div className="col-md-5">
            <AttendanceWidget userId={user?.id} />
          </div>
          <div className="col-md-7">
            <div className="hrms-card">
              <AttendanceCalendar records={records} leaves={leaves} userId={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ManagerLeaves() {
  const dispatch = useDispatch();
  const { records } = useSelector(s => s.leaves);
  const { list: users } = useSelector(s => s.users);
  useEffect(() => { dispatch(fetchLeaves()); dispatch(fetchUsers()); }, [dispatch]);

  const pending = records.filter(l => l.status === "pending");
  const getUserName = (id) => users.find(u => u.id === id)?.name || id;
  const statusColor = { pending: "var(--warning)", approved: "var(--success)", rejected: "var(--danger)" };

  return (
    <>
      <Topbar title="Leave Requests" />
      <div className="page-content">
        {pending.length > 0 && (
          <div className="hrms-card mb-4">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>Pending ({pending.length})</div>
            {pending.map(leave => (
              <div key={leave.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{getUserName(leave.userId)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{leave.date} · {leave.type} · {leave.reason}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-hrms" style={{ background: "rgba(34,197,94,0.15)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.3)", padding: "6px 14px", fontSize: 12 }} onClick={() => dispatch(updateLeaveStatus({ id: leave.id, status: "approved" }))}>
                    <i className="bi bi-check-lg"></i> Approve
                  </button>
                  <button className="btn-hrms btn-danger-hrms" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => dispatch(updateLeaveStatus({ id: leave.id, status: "rejected" }))}>
                    <i className="bi bi-x-lg"></i> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="hrms-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>All Leaves</div>
          <table className="hrms-table">
            <thead><tr><th>Employee</th><th>Date</th><th>Type</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {[...records].reverse().map(leave => (
                <tr key={leave.id}>
                  <td style={{ fontWeight: 600 }}>{getUserName(leave.userId)}</td>
                  <td style={{ fontFamily: "Space Mono", fontSize: 13 }}>{leave.date}</td>
                  <td style={{ fontSize: 13, textTransform: "capitalize" }}>{leave.type}</td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{leave.reason}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, color: statusColor[leave.status], textTransform: "uppercase" }}>{leave.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
