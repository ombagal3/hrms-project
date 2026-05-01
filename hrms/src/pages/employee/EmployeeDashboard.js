import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { fetchUserAttendance } from "../../store/slices/attendanceSlice";
import { fetchUserLeaves } from "../../store/slices/leavesSlice";
import AttendanceWidget from "../../components/AttendanceWidget";
import AttendanceCalendar from "../../components/AttendanceCalendar";
import SalaryCard from "../../components/SalaryCard";
import LeaveSection from "../../components/LeaveSection";

const NAV = [
  { icon: "grid-1x2", label: "Dashboard", path: "/employee" },
  { icon: "person-circle", label: "My Profile", path: "/employee/profile" },
  { icon: "calendar-check", label: "Attendance", path: "/employee/attendance" },
  { icon: "cash-coin", label: "Salary", path: "/employee/salary" },
  { icon: "calendar2-x", label: "Leaves", path: "/employee/leaves" },
];

export default function EmployeeDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar navItems={NAV} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<EmpHome />} />
          <Route path="/profile" element={<EmpProfile />} />
          <Route path="/attendance" element={<EmpAttendance />} />
          <Route path="/salary" element={<EmpSalary />} />
          <Route path="/leaves" element={<EmpLeaves />} />
        </Routes>
      </div>
    </div>
  );
}

function EmpHome() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { records: attendance } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);

  useEffect(() => {
    dispatch(fetchUserAttendance(user?.id));
    dispatch(fetchUserLeaves(user?.id));
  }, [dispatch, user]);

  const now = new Date();
  const thisMonth = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const presentDays = thisMonth.filter(a => a.checkOut).length;
  const missedCheckout = thisMonth.filter(a => a.checkIn && !a.checkOut && a.date < now.toISOString().split("T")[0]).length;

  return (
    <>
      <Topbar title="My Dashboard" />
      <div className="page-content">
        <div className="mb-4">
          <h5 style={{ fontWeight: 700 }}>Welcome, {user?.name} 👋</h5>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>{user?.designation} · {user?.department}</p>
        </div>

        <div className="row g-3 mb-4">
          {[
            { label: "Days Present", value: presentDays, icon: "check-circle-fill", color: "var(--success)" },
            { label: "Leaves Applied", value: leaves.length, icon: "calendar-x", color: "var(--info)" },
            { label: "Missed Checkout", value: missedCheckout, icon: "exclamation-triangle-fill", color: "var(--warning)" },
            { label: "Hourly Rate", value: `₹${user?.salary}`, icon: "cash", color: "var(--accent)" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="col-6 col-xl-3">
              <div className="stat-card accent">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div className="stat-value" style={{ color, fontSize: 22 }}>{value}</div>
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

        {missedCheckout > 0 && (
          <div className="hrms-alert warning mb-4">
            <i className="bi bi-exclamation-triangle-fill"></i>
            You have <strong>{missedCheckout} missed checkout(s)</strong> this month. A penalty of ₹500 applies per missed checkout.
          </div>
        )}

        <div className="row g-3">
          <div className="col-md-6">
            <AttendanceWidget userId={user?.id} />
          </div>
          <div className="col-md-6">
            <div className="hrms-card">
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>Leave Policy</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                {[
                  { icon: "check-circle", color: "var(--success)", text: "1 free paid leave per month (no salary deduction)" },
                  { icon: "exclamation-circle", color: "var(--warning)", text: "Additional paid leaves will have salary deducted" },
                  { icon: "sun", color: "var(--info)", text: "Sundays are not counted as working days" },
                  { icon: "clock-history", color: "var(--danger)", text: "Missing checkout = ₹500 penalty + half-day salary" },
                  { icon: "clock", color: "var(--warning)", text: "Arriving after 9:45 AM = half day counted" },
                ].map(({ icon, color, text }, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`bi bi-${icon}`} style={{ color, marginTop: 1, flexShrink: 0 }}></i>
                    <span style={{ color: "var(--text-muted)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EmpProfile() {
  const { user } = useSelector(s => s.auth);

  const fields = [
    { label: "Full Name", value: user?.name },
    { label: "Email", value: user?.email },
    { label: "Phone", value: user?.phone },
    { label: "Department", value: user?.department },
    { label: "Designation", value: user?.designation },
    { label: "Role", value: user?.role },
    { label: "Join Date", value: user?.joinDate },
    { label: "Hourly Rate", value: `₹${user?.salary}/hr` },
    { label: "Status", value: user?.status },
  ];

  const roleColor = { admin: "#ef4444", manager: "#4f7df3", employee: "#22c55e" }[user?.role];

  return (
    <>
      <Topbar title="My Profile" />
      <div className="page-content">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="hrms-card" style={{ textAlign: "center" }}>
              <div style={{ width: 100, height: 100, borderRadius: 20, background: roleColor, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontFamily: "Space Mono", fontWeight: 700, margin: "0 auto 16px" }}>
                {user?.avatar}
              </div>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{user?.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>{user?.designation}</div>
              <span className={`role-badge ${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <div className="col-md-8">
            <div className="hrms-card">
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 16 }}>Employee Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {fields.map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontWeight: 500, fontSize: 14, textTransform: label === "Role" || label === "Status" ? "capitalize" : "none" }}>{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EmpAttendance() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { records } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);
  useEffect(() => { dispatch(fetchUserAttendance(user?.id)); dispatch(fetchUserLeaves(user?.id)); }, [dispatch, user]);

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

function EmpSalary() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  useEffect(() => { dispatch(fetchUserAttendance(user?.id)); dispatch(fetchUserLeaves(user?.id)); }, [dispatch, user]);

  return (
    <>
      <Topbar title="My Salary" />
      <div className="page-content">
        <div className="hrms-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
            <div className="avatar avatar-lg" style={{ background: "var(--success)" }}>{user?.avatar}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{user?.designation} · Rate: ₹{user?.salary}/hr · ₹{user?.salary * 8}/day</div>
            </div>
          </div>
          <SalaryCard userId={user?.id} hourlyRate={user?.salary || 0} />
        </div>
      </div>
    </>
  );
}

function EmpLeaves() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  useEffect(() => { dispatch(fetchUserLeaves(user?.id)); }, [dispatch, user]);

  return (
    <>
      <Topbar title="My Leaves" />
      <div className="page-content">
        <div className="hrms-card">
          <LeaveSection userId={user?.id} />
        </div>
      </div>
    </>
  );
}
