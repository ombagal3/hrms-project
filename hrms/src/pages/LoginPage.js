import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "manager") navigate("/manager");
      else navigate("/employee");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser(form));
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="logo-mark mb-1" style={{ fontSize: 28 }}>HRMS</div>
          <div className="logo-sub" style={{ fontSize: 10 }}>Human Resource Management</div>
        </div>

        <div className="mb-4 p-3" style={{ background: "rgba(79,125,243,0.06)", borderRadius: 10, border: "1px solid rgba(79,125,243,0.15)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Quick Login</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { label: "Admin", email: "admin@hrms.com", pass: "admin123", color: "#ef4444" },
              { label: "Manager", email: "manager@hrms.com", pass: "manager123", color: "#4f7df3" },
              { label: "Employee", email: "employee@hrms.com", pass: "emp123", color: "#22c55e" },
            ].map(({ label, email, pass, color }) => (
              <button key={label} onClick={() => fill(email, pass)}
                style={{ background: "transparent", border: `1px solid ${color}40`, color, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="hrms-alert error">
            <i className="bi bi-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="hrms-label">Email Address</label>
            <input className="hrms-input" type="email" placeholder="Enter email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-4">
            <label className="hrms-label">Password</label>
            <input className="hrms-input" type="password" placeholder="Enter password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn-hrms btn-primary-hrms w-100 justify-content-center" type="submit" disabled={loading}
            style={{ padding: "12px", fontSize: 14 }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}
