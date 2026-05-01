import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkIn, checkOut, clearAttendanceMsg } from "../store/slices/attendanceSlice";
import { todayStr, isSunday } from "../utils/salaryUtils";

export default function AttendanceWidget({ userId }) {
  const dispatch = useDispatch();
  const { records, loading, error, success } = useSelector((s) => s.attendance);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => dispatch(clearAttendanceMsg()), 3000);
      return () => clearTimeout(t);
    }
  }, [error, success, dispatch]);

  const today = todayStr();
  const todayRecord = records.find((r) => r.date === today && r.userId === userId);
  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;
  const isToday = !isSunday(today);

  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="hrms-card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Today's Attendance</div>
        <div className="clock-display mt-2">{timeStr}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {(error || success) && (
        <div className={`hrms-alert ${error ? "error" : "success"}`}>
          <i className={`bi bi-${error ? "exclamation-circle" : "check-circle"}`}></i>
          {error || success}
        </div>
      )}

      {isSunday(today) && (
        <div className="hrms-alert info"><i className="bi bi-sun"></i> Today is Sunday — enjoy your day off!</div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className={`checkin-btn ${hasCheckedIn && !hasCheckedOut ? "checked-in" : ""}`}
          disabled={loading || hasCheckedOut || !isToday || hasCheckedIn}
          onClick={() => dispatch(checkIn(userId))}>
          <i className={`bi bi-${hasCheckedIn ? "check-circle-fill" : "box-arrow-in-right"}`} style={{ fontSize: 22 }}></i>
          <span>{hasCheckedIn ? "Checked In" : "Check In"}</span>
        </button>

        <button
          className={`checkin-btn ${hasCheckedIn && !hasCheckedOut ? "checked-in" : ""}`}
          disabled={loading || !hasCheckedIn || hasCheckedOut || !isToday}
          onClick={() => dispatch(checkOut(userId))}>
          <i className={`bi bi-${hasCheckedOut ? "check-circle-fill" : "box-arrow-right"}`} style={{ fontSize: 22 }}></i>
          <span>{hasCheckedOut ? "Checked Out" : "Check Out"}</span>
        </button>

        <div style={{ flex: 1, minWidth: 140 }}>
          {todayRecord && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {todayRecord.checkIn && (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)", marginRight: 6 }}>In:</span>
                  <span style={{ fontFamily: "Space Mono", color: "var(--success)" }}>{todayRecord.checkIn}</span>
                </div>
              )}
              {todayRecord.checkOut && (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)", marginRight: 6 }}>Out:</span>
                  <span style={{ fontFamily: "Space Mono", color: "var(--danger)" }}>{todayRecord.checkOut}</span>
                </div>
              )}
            </div>
          )}
          {!todayRecord && isToday && (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Not checked in yet<br />Work starts at 09:00</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
        <span><i className="bi bi-clock me-1"></i>In: 09:00</span>
        <span><i className="bi bi-clock-history me-1"></i>Out: 17:00</span>
        <span><i className="bi bi-hourglass me-1"></i>8 hrs / day</span>
      </div>
    </div>
  );
}
