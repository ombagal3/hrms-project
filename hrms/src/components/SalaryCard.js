import React, { useState } from "react";
import { useSelector } from "react-redux";
import { calcMonthlySummary, formatCurrency, getDaysInMonth, isSunday } from "../utils/salaryUtils";

export default function SalaryCard({ userId, hourlyRate }) {
  const { records: attendance } = useSelector(s => s.attendance);
  const { records: leaves } = useSelector(s => s.leaves);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const userAtt = attendance.filter(a => a.userId === userId);
  const userLeaves = leaves.filter(l => l.userId === userId);

  const summary = calcMonthlySummary(userAtt, userLeaves, hourlyRate, month, year);
  const monthName = new Date(year, month - 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const dailyRate = hourlyRate * 8;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Salary Summary</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-hrms btn-outline-hrms" style={{ padding: "4px 10px" }} onClick={prevMonth}><i className="bi bi-chevron-left"></i></button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 120, textAlign: "center" }}>{monthName}</span>
          <button className="btn-hrms btn-outline-hrms" style={{ padding: "4px 10px" }} onClick={nextMonth}><i className="bi bi-chevron-right"></i></button>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Work Days", val: summary.totalWorkDays, color: "var(--accent)" },
          { label: "Present", val: summary.presentDays, color: "var(--success)" },
          { label: "Absent", val: summary.absentDays, color: "var(--danger)" },
          { label: "Half Day", val: summary.halfDays, color: "var(--warning)" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", textAlign: "center", border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "Space Mono", fontWeight: 700, fontSize: 20, color }}>{val}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div>
        <div className="salary-row">
          <span style={{ color: "var(--text-muted)" }}>Rate</span>
          <span>{formatCurrency(hourlyRate)}/hr · {formatCurrency(dailyRate)}/day</span>
        </div>
        <div className="salary-row">
          <span style={{ color: "var(--text-muted)" }}>Gross Earnings</span>
          <span style={{ color: "var(--success)" }}>+{formatCurrency(summary.grossSalary)}</span>
        </div>
        {summary.penalty > 0 && (
          <div className="salary-row">
            <span style={{ color: "var(--text-muted)" }}>Penalty (Missed Checkout)</span>
            <span style={{ color: "var(--danger)" }}>−{formatCurrency(summary.penalty)}</span>
          </div>
        )}
        {summary.extraLeaveDeduction > 0 && (
          <div className="salary-row">
            <span style={{ color: "var(--text-muted)" }}>Extra Paid Leave Deduction</span>
            <span style={{ color: "var(--danger)" }}>−{formatCurrency(summary.extraLeaveDeduction)}</span>
          </div>
        )}
        <div className="salary-row total" style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <span>Net Salary</span>
          <span style={{ color: "var(--accent)", fontSize: 20 }}>{formatCurrency(summary.netSalary)}</span>
        </div>
      </div>
    </div>
  );
}
