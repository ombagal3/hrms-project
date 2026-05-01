import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyLeave, clearLeavesMsg } from "../store/slices/leavesSlice";
import { isSunday, FREE_PAID_LEAVES } from "../utils/salaryUtils";

export default function LeaveSection({ userId }) {
  const dispatch = useDispatch();
  const { records, loading, error, success } = useSelector((s) => s.leaves);
  const userLeaves = records.filter(r => r.userId === userId);

  const [form, setForm] = useState({ date: "", type: "paid", reason: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (success) { setShowForm(false); setForm({ date: "", type: "paid", reason: "" }); }
    if (error || success) { const t = setTimeout(() => dispatch(clearLeavesMsg()), 3000); return () => clearTimeout(t); }
  }, [error, success, dispatch]);

  const thisMonth = new Date();
  const monthLeaves = userLeaves.filter(l => {
    const d = new Date(l.date);
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear() && l.status === "approved";
  });
  const paidLeavesThisMonth = monthLeaves.filter(l => l.type === "paid").length;
  const extraPaid = Math.max(0, paidLeavesThisMonth - FREE_PAID_LEAVES);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSunday(form.date)) { alert("You cannot apply leave on Sunday — it's already a holiday!"); return; }
    dispatch(applyLeave({ ...form, userId, appliedOn: new Date().toISOString().split("T")[0] }));
  };

  const statusColor = { pending: "var(--warning)", approved: "var(--success)", rejected: "var(--danger)" };
  const statusBg = { pending: "rgba(245,158,11,0.12)", approved: "rgba(34,197,94,0.12)", rejected: "rgba(239,68,68,0.12)" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Leave Management</div>
          {paidLeavesThisMonth > 0 && (
            <div style={{ fontSize: 12, color: extraPaid > 0 ? "var(--danger)" : "var(--success)", marginTop: 4 }}>
              {extraPaid > 0
                ? `⚠ ${extraPaid} extra paid leave(s) this month — deduction applies`
                : `✓ ${paidLeavesThisMonth}/${FREE_PAID_LEAVES} free leave used this month`}
            </div>
          )}
        </div>
        <button className="btn-hrms btn-primary-hrms" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-plus-lg"></i> Apply Leave
        </button>
      </div>

      {showForm && (
        <div className="hrms-card mb-3" style={{ border: "1px solid rgba(79,125,243,0.3)", background: "rgba(79,125,243,0.06)" }}>
          {(error || success) && (
            <div className={`hrms-alert ${error ? "error" : "success"}`}>
              <i className={`bi bi-${error ? "exclamation-circle" : "check-circle"}`}></i> {error || success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="hrms-label">Leave Date</label>
                <input className="hrms-input" type="date" value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="hrms-label">Leave Type</label>
                <select className="hrms-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="paid">Paid Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="hrms-label">Reason</label>
                <input className="hrms-input" type="text" placeholder="Brief reason" value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-hrms btn-primary-hrms" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
              <button type="button" className="btn-hrms btn-outline-hrms" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {userLeaves.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: 13 }}>
            <i className="bi bi-calendar-x" style={{ fontSize: 28, display: "block", marginBottom: 8 }}></i>
            No leave applications yet
          </div>
        )}
        {[...userLeaves].reverse().map(leave => (
          <div key={leave.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{leave.date}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{leave.reason} · <span style={{ textTransform: "capitalize" }}>{leave.type}</span></div>
            </div>
            <div style={{ padding: "4px 12px", borderRadius: 20, background: statusBg[leave.status], color: statusColor[leave.status], fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {leave.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
