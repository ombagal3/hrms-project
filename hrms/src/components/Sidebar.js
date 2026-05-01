import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Sidebar({ navItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const roleColor = { admin: "#ef4444", manager: "#4f7df3", employee: "#22c55e" }[user?.role] || "#4f7df3";

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">HRMS</div>
        <div className="logo-sub">Management System</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ icon, label, path }) => (
          <div key={path} className={`nav-item-custom ${location.pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}>
            <i className={`bi bi-${icon}`}></i>
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="user-info-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div className="avatar" style={{ background: roleColor }}>{user?.avatar || user?.name?.slice(0,2).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user?.designation || user?.role}</div>
          </div>
        </div>
        <div className={`role-badge ${user?.role}`} style={{ marginBottom: 12, display: "inline-block" }}>
          {user?.role}
        </div>
        <div
          className="nav-item-custom"
          style={{ padding: "8px 0", borderLeft: "none", color: "#ef4444", marginLeft: 0 }}
          onClick={() => { dispatch(logout()); navigate("/login"); }}>
          <i className="bi bi-box-arrow-left"></i>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}
