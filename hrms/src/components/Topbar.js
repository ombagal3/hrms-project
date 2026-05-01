import React from "react";

export default function Topbar({ title, children }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="topbar">
      <div className="page-title">{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {children}
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{dateStr}</div>
      </div>
    </div>
  );
}
