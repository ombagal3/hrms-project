import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { fetchUsers, createUser, updateUser, deleteUser, clearUsersError } from "../../store/slices/usersSlice";
import { fetchAttendance } from "../../store/slices/attendanceSlice";
import { fetchLeaves, updateLeaveStatus } from "../../store/slices/leavesSlice";
import AttendanceWidget from "../../components/AttendanceWidget";
import AttendanceCalendar from "../../components/AttendanceCalendar";
import SalaryCard from "../../components/SalaryCard";
import LeaveSection from "../../components/LeaveSection";
import { formatCurrency } from "../../utils/salaryUtils";

const NAV = [
  { icon: "grid-1x2", label: "Dashboard", path: "/admin" },
  { icon: "people", label: "Employees", path: "/admin/employees" },
  { icon: "calendar-check", label: "Attendance", path: "/admin/attendance" },
  { icon: "calendar2-x", label: "Leaves", path: "/admin/leaves" },
  { icon: "cash-coin", label: "Salary", path: "/admin/salary" },
];

export default function AdminDashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar navItems={NAV} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/employees" element={<EmployeesCRUD />} />
          <Route path="/attendance" element={<AdminAttendance />} />
          <Route path="/leaves" element={<AdminLeaves />} />
          <Route path="/salary" element={<AdminSalary />} />
        </Routes>
      </div>
    </div>
  );
}

// ─── HOME ───
function AdminHome() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { list: users } = useSelector(s => s.users);
  const { records: attendance } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAttendance());
    dispatch(fetchLeaves());
  }, [dispatch]);

  const today = new Date().toISOString().split("T")[0];
  const todayAtt = attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter(a => a.checkIn).length;
  const pendingLeaves = leaves.filter(l => l.status === "pending").length;
  const employees = users.filter(u => u.role !== "admin");

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-content">
        <div className="mb-4">
          <h5 style={{ fontWeight: 700 }}>Welcome back, {user?.name} 👋</h5>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>Here's what's happening today.</p>
        </div>

        <div className="row g-3 mb-4">
          {[
            { label: "Total Employees", value: employees.length, icon: "people-fill", cls: "accent", color: "var(--accent)" },
            { label: "Present Today", value: presentToday, icon: "check-circle-fill", cls: "green", color: "var(--success)" },
            { label: "On Leave", value: leaves.filter(l => l.date === today && l.status === "approved").length, icon: "calendar-x-fill", cls: "yellow", color: "var(--warning)" },
            { label: "Pending Leaves", value: pendingLeaves, icon: "hourglass-split", cls: "red", color: "var(--danger)" },
          ].map(({ label, value, icon, cls, color }) => (
            <div key={label} className="col-6 col-xl-3">
              <div className={`stat-card ${cls}`}>
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
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>Recent Employees</div>
              {employees.slice(0, 5).map(emp => (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div className="avatar" style={{ background: emp.role === "manager" ? "var(--accent)" : "var(--success)" }}>{emp.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{emp.department} · {emp.designation}</div>
                  </div>
                  <span className={`role-badge ${emp.role}`}>{emp.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── EMPLOYEES CRUD ───
function EmployeesCRUD() {
  const dispatch = useDispatch();
  const { list: users, loading, error } = useSelector(s => s.users);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee", department: "", designation: "", phone: "", salary: "", joinDate: "" });

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  useEffect(() => {
    if (error) { const t = setTimeout(() => dispatch(clearUsersError()), 3000); return () => clearTimeout(t); }
  }, [error, dispatch]);

  const openCreate = () => { setForm({ name: "", email: "", password: "", role: "employee", department: "", designation: "", phone: "", salary: "", joinDate: new Date().toISOString().split("T")[0] }); setModal("create"); };
  const openEdit = (user) => { setSelected(user); setForm({ ...user, password: "" }); setModal("edit"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const avatar = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    if (modal === "create") {
      const r = await dispatch(createUser({ ...form, avatar, salary: Number(form.salary) }));
      if (!r.error) closeModal();
    } else {
      const payload = { id: selected.id, ...form, avatar, salary: Number(form.salary) };
      if (!form.password) delete payload.password;
      const r = await dispatch(updateUser(payload));
      if (!r.error) closeModal();
    }
  };

  const handleDelete = (id) => { if (window.confirm("Delete this user?")) dispatch(deleteUser(id)); };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Employee Management" />
      <div className="page-content">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <input className="hrms-input" style={{ maxWidth: 300 }} placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-hrms btn-primary-hrms" onClick={openCreate}><i className="bi bi-person-plus"></i> Add Employee</button>
        </div>

        {error && <div className="hrms-alert error"><i className="bi bi-exclamation-circle"></i>{error}</div>}

        <div className="hrms-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Employee</th><th>Role</th><th>Department</th><th>Designation</th><th>Phone</th><th>Rate/hr</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar">{u.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                  <td style={{ fontSize: 13 }}>{u.department}</td>
                  <td style={{ fontSize: 13 }}>{u.designation}</td>
                  <td style={{ fontSize: 13 }}>{u.phone}</td>
                  <td style={{ fontFamily: "Space Mono", fontSize: 13 }}>{formatCurrency(u.salary)}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: u.status === "active" ? "var(--success)" : "var(--danger)" }}>
                      <span className="status-dot" style={{ background: u.status === "active" ? "var(--success)" : "var(--danger)" }}></span>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-hrms btn-outline-hrms" style={{ padding: "5px 10px" }} onClick={() => openEdit(u)}><i className="bi bi-pencil"></i></button>
                      <button className="btn-hrms btn-danger-hrms" style={{ padding: "5px 10px" }} onClick={() => handleDelete(u.id)}><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop-hrms" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h5 style={{ margin: 0, fontWeight: 700 }}>{modal === "create" ? "Add Employee" : "Edit Employee"}</h5>
              <button onClick={closeModal} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            {error && <div className="hrms-alert error"><i className="bi bi-exclamation-circle"></i>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6"><label className="hrms-label">Full Name</label><input className="hrms-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Email</label><input className="hrms-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Password {modal === "edit" && "(leave blank to keep)"}</label><input className="hrms-input" type="password" required={modal === "create"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Role</label>
                  <select className="hrms-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-6"><label className="hrms-label">Department</label><input className="hrms-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Designation</label><input className="hrms-input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Phone</label><input className="hrms-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Hourly Rate (₹)</label><input className="hrms-input" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Join Date</label><input className="hrms-input" type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} /></div>
                <div className="col-md-6"><label className="hrms-label">Status</label>
                  <select className="hrms-input" value={form.status || "active"} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="btn-hrms btn-primary-hrms" type="submit" disabled={loading}>
                  {loading ? "Saving..." : modal === "create" ? "Create Employee" : "Update Employee"}
                </button>
                <button type="button" className="btn-hrms btn-outline-hrms" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── ATTENDANCE ───
function AdminAttendance() {
  const dispatch = useDispatch();
  const { list: users } = useSelector(s => s.users);
  const { records } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);
  const { user } = useSelector(s => s.auth);
  const [selUser, setSelUser] = useState(null);

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchAttendance()); dispatch(fetchLeaves()); }, [dispatch]);

  const employees = users.filter(u => u.role !== "admin");

  return (
    <>
      <Topbar title="Attendance Overview" />
      <div className="page-content">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="hrms-card mb-3">
              <AttendanceWidget userId={user?.id} />
            </div>
            <div className="hrms-card">
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>View Employee Attendance</div>
              {employees.map(emp => (
                <div key={emp.id} onClick={() => setSelUser(selUser?.id === emp.id ? null : emp)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 8, cursor: "pointer", background: selUser?.id === emp.id ? "rgba(79,125,243,0.1)" : "transparent", marginBottom: 4, transition: "background 0.1s" }}>
                  <div className="avatar" style={{ background: emp.role === "manager" ? "var(--accent)" : "var(--success)" }}>{emp.avatar}</div>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{emp.department}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-8">
            {selUser ? (
              <div className="hrms-card">
                <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 16 }}>{selUser.name}'s Attendance</div>
                <AttendanceCalendar records={records} leaves={leaves} userId={selUser.id} />
              </div>
            ) : (
              <div className="hrms-card" style={{ textAlign: "center", padding: 48 }}>
                <i className="bi bi-person-lines-fill" style={{ fontSize: 48, color: "var(--text-muted)", display: "block", marginBottom: 12 }}></i>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Select an employee to view their attendance</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── LEAVES ───
function AdminLeaves() {
  const dispatch = useDispatch();
  const { records } = useSelector(s => s.leaves);
  const { list: users } = useSelector(s => s.users);

  useEffect(() => { dispatch(fetchLeaves()); dispatch(fetchUsers()); }, [dispatch]);

  const getUserName = (id) => users.find(u => u.id === id)?.name || id;

  const pending = records.filter(l => l.status === "pending");
  const others = records.filter(l => l.status !== "pending");

  const statusColor = { pending: "var(--warning)", approved: "var(--success)", rejected: "var(--danger)" };

  return (
    <>
      <Topbar title="Leave Management" />
      <div className="page-content">
        {pending.length > 0 && (
          <div className="hrms-card mb-4">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>
              Pending Approval ({pending.length})
            </div>
            {pending.map(leave => (
              <div key={leave.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{getUserName(leave.userId)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{leave.date} · {leave.type} · {leave.reason}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-hrms" style={{ background: "rgba(34,197,94,0.15)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.3)", padding: "6px 14px", fontSize: 12 }}
                    onClick={() => dispatch(updateLeaveStatus({ id: leave.id, status: "approved" }))}>
                    <i className="bi bi-check-lg"></i> Approve
                  </button>
                  <button className="btn-hrms btn-danger-hrms" style={{ padding: "6px 14px", fontSize: 12 }}
                    onClick={() => dispatch(updateLeaveStatus({ id: leave.id, status: "rejected" }))}>
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
            <thead><tr><th>Employee</th><th>Date</th><th>Type</th><th>Reason</th><th>Applied On</th><th>Status</th></tr></thead>
            <tbody>
              {[...records].reverse().map(leave => (
                <tr key={leave.id}>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>{getUserName(leave.userId)}</td>
                  <td style={{ fontFamily: "Space Mono", fontSize: 13 }}>{leave.date}</td>
                  <td><span style={{ textTransform: "capitalize", fontSize: 13 }}>{leave.type}</span></td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{leave.reason}</td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{leave.appliedOn}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[leave.status], textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── SALARY ───
function AdminSalary() {
  const dispatch = useDispatch();
  const { list: users } = useSelector(s => s.users);
  const [selUser, setSelUser] = useState(null);

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchAttendance()); dispatch(fetchLeaves()); }, [dispatch]);

  const employees = users.filter(u => u.role !== "admin" && u.salary > 0);

  return (
    <>
      <Topbar title="Salary Overview" />
      <div className="page-content">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="hrms-card">
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>Select Employee</div>
              {employees.map(emp => (
                <div key={emp.id} onClick={() => setSelUser(emp)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 8, cursor: "pointer", background: selUser?.id === emp.id ? "rgba(79,125,243,0.1)" : "transparent", marginBottom: 4, transition: "background 0.1s" }}>
                  <div className="avatar" style={{ background: emp.role === "manager" ? "var(--accent)" : "var(--success)" }}>{emp.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatCurrency(emp.salary)}/hr</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-8">
            {selUser ? (
              <div className="hrms-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                  <div className="avatar avatar-lg">{selUser.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{selUser.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{selUser.designation} · {selUser.department}</div>
                  </div>
                </div>
                <SalaryCard userId={selUser.id} hourlyRate={selUser.salary} />
              </div>
            ) : (
              <div className="hrms-card" style={{ textAlign: "center", padding: 48 }}>
                <i className="bi bi-cash-coin" style={{ fontSize: 48, color: "var(--text-muted)", display: "block", marginBottom: 12 }}></i>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Select an employee to view salary details</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
