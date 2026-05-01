import React, { useState } from "react";
import { isSunday, getDaysInMonth, STATUS_BADGES } from "../utils/salaryUtils";

export default function AttendanceCalendar({ records, leaves, userId }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const days = getDaysInMonth(month, year);
  const today = now.toISOString().split("T")[0];

  // Get first day of month to align calendar
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const blanks = Array(firstDay).fill(null);

  const getDayStatus = (dayStr) => {
    if (isSunday(dayStr)) return "sunday";
    if (dayStr > today) return "future";
    const leave = leaves.find(l => l.date === dayStr && l.userId === userId && l.status === "approved");
    if (leave) return "leave";
    const rec = records.find(r => r.date === dayStr && r.userId === userId);
    if (!rec) return dayStr <= today ? "absent" : "future";
    if (!rec.checkOut) return "missed_checkout";
    const inMins = rec.checkIn.split(":").reduce((a, b, i) => a + (i === 0 ? +b * 60 : +b), 0);
    const lateThreshold = 9 * 60 + 45;
    if (inMins >= lateThreshold) return "half_day";
    return "present";
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const monthName = new Date(year, month - 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  const statusColors = {
    present: "var(--success)", absent: "var(--danger)",
    half_day: "var(--warning)", missed_checkout: "var(--warning)",
    leave: "var(--info)", sunday: "var(--text-muted)", future: "rgba(255,255,255,0.1)"
  };

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button className="btn-hrms btn-outline-hrms" onClick={prevMonth}><i className="bi bi-chevron-left"></i></button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{monthName}</div>
        <button className="btn-hrms btn-outline-hrms" onClick={nextMonth}><i className="bi bi-chevron-right"></i></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "4px 0" }}>{d}</div>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map(dayStr => {
          const dayNum = parseInt(dayStr.split("-")[2]);
          const status = getDayStatus(dayStr);
          const isToday = dayStr === today;
          return (
            <div key={dayStr}
              style={{
                aspectRatio: "1",
                borderRadius: 8,
                background: status === "future" ? "transparent" : `${statusColors[status]}15`,
                border: isToday ? `2px solid var(--accent)` : `1px solid ${statusColors[status]}30`,
                color: statusColors[status],
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontFamily: "Space Mono, monospace",
                fontWeight: 700,
                opacity: status === "future" ? 0.3 : 1,
              }}>
              {dayNum}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {Object.entries({ present: "Present", absent: "Absent", half_day: "Half Day", missed_checkout: "Missed Out", leave: "Leave", sunday: "Sunday" }).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: statusColors[key] }}></div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
