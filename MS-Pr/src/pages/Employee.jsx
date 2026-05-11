import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttendance,
  markAttendance,
  updateAttendance
} from "../features/attendance/attendanceSlice";
import { applyLeave, fetchLeaves } from "../features/leave/leaveSlice";
import { fetchUsers } from "../features/users/userSlice";
import {
  calculateSalaryDeductions,
  calculateCheckoutPayroll,
  formatTime,
  getAttendanceTotal,
  getLocalDateKey,
  getMonthKey,
  getPayrollRates,
  monthlyWorkHours,
  normalHours,
  roundMoney
} from "../utils/payroll";

export default function Employee() {
  const dispatch = useDispatch();

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("attendance");
  const [now, setNow] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const attendance = useSelector((state) => state.attendance.list);
  const leaves = useSelector((state) => state.leave.list);
  const users = useSelector((state) => state.users.list);

  const user = useMemo(() => {
    return (
      users.find((item) => item.id === savedUser?.id) ||
      users.find((item) => item.email === savedUser?.email) ||
      savedUser
    );
  }, [savedUser, users]);

  useEffect(() => {
    dispatch(fetchAttendance());
    dispatch(fetchLeaves());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = getLocalDateKey();

  const myLeaves = useMemo(() => {
    return leaves.filter(
      (leave) =>
        leave.userId === user?.id ||
        leave.email === user?.email ||
        leave.name === user?.name
    );
  }, [leaves, user?.email, user?.id, user?.name]);

  const myAttendance = useMemo(() => {
    return attendance.filter(
      (item) =>
        item.userId === user?.id ||
        item.email === user?.email ||
        item.name === user?.name
    );
  }, [attendance, user?.email, user?.id, user?.name]);

  const todayAttendance = myAttendance.find(
    (item) =>
      item.date === today &&
      item.dayType !== "paid-sunday" &&
      item.status !== "paid-sunday"
  );
  const todayLeave = myLeaves.find(
    (leave) => leave.date === today && leave.status !== "rejected"
  );
  const activeAttendance = myAttendance.find(
    (item) => item.date === today && item.status === "checked-in"
  );

  const monthlySalary = Number(user?.monthlySalary || user?.salary || 0);
  const joinMonthKey = user?.joinDate ? getMonthKey(user.joinDate) : "";
  const { dailySalary, hourlySalary } = getPayrollRates(monthlySalary);
  const totalLeaves = myLeaves.length;
  const pendingLeaves = myLeaves.filter((l) => l.status === "pending").length;
  const approvedLeaves = myLeaves.filter((l) => l.status === "approved").length;
  const visibleAttendance = myAttendance.filter(
    (item) => item.dayType !== "paid-sunday" && item.status !== "paid-sunday"
  );
  const salaryMonthKey = selectedMonth || getMonthKey();
  const isBeforeJoinMonth =
    joinMonthKey && salaryMonthKey.localeCompare(joinMonthKey) < 0;
  const monthlyAttendance = visibleAttendance.filter((item) =>
    !isBeforeJoinMonth && String(item.date || "").startsWith(salaryMonthKey)
  );
  const monthlyPaidDays = monthlyAttendance.filter(
    (item) => item.status === "completed"
  ).length;
  const monthlyApprovedLeaves = myLeaves.filter(
    (leave) =>
      !isBeforeJoinMonth &&
      leave.status === "approved" &&
      String(leave.date || "").startsWith(salaryMonthKey)
  );
  const paidLeaveDays = Math.min(1, monthlyApprovedLeaves.length);
  const unpaidLeaveDays = Math.max(0, monthlyApprovedLeaves.length - paidLeaveDays);
  const paidLeaveAmount = roundMoney(dailySalary * paidLeaveDays);
  const leaveDeduction = roundMoney(dailySalary * unpaidLeaveDays);
  const attendanceSalary = getAttendanceTotal(monthlyAttendance);
  const monthlyGrossSalary = roundMoney(attendanceSalary + paidLeaveAmount);
  const salarySummary = calculateSalaryDeductions(
    monthlyGrossSalary,
    leaveDeduction
  );

  if (!user) {
    return <h3>Please login again</h3>;
  }

  const handleApply = () => {
    if (!date || !reason.trim()) {
      alert("Leave date and reason required");
      return;
    }

    dispatch(
      applyLeave({
        userId: user.id,
        name: user.name,
        email: user.email,
        field: user.field || "",
        managerId: user.managerId || "",
        managerName: user.managerName || "",
        date,
        reason,
        status: "pending"
      })
    );
    setDate("");
    setReason("");
  };

  const handleAttendance = () => {
    if (!monthlySalary) {
      alert("Monthly salary admin panel me set karo");
      return;
    }

    const currentTime = new Date();

    if (!activeAttendance) {
      if (todayLeave) {
        alert("Aaj leave applied hai, check in nahi kar sakte");
        return;
      }

      if (todayAttendance) {
        alert("Today attendance already completed");
        return;
      }

      dispatch(
        markAttendance({
          userId: user.id,
          name: user.name,
          email: user.email,
          date: today,
          checkIn: currentTime.toLocaleTimeString(),
          checkInAt: currentTime.toISOString(),
          checkOut: "",
          checkOutAt: "",
          normalHours,
          monthlySalary,
          hourlySalary,
          workedHours: 0,
          overtimeHours: 0,
          salaryAmount: 0,
          status: "checked-in"
        })
      );
      return;
    }

    const payroll = calculateCheckoutPayroll({
      checkInAt: activeAttendance.checkInAt,
      checkOutAt: currentTime.toISOString(),
      monthlySalary
    });

    dispatch(
      updateAttendance({
        ...activeAttendance,
        checkOut: currentTime.toLocaleTimeString(),
        checkOutAt: currentTime.toISOString(),
        workedHours: payroll.workedHours,
        overtimeHours: payroll.overtimeHours,
        salaryAmount: payroll.salaryAmount,
        dayType: payroll.dayType,
        status: "completed"
      })
    );
  };

  const handlePrintSalarySlip = () => {
    const salaryMonth = new Date(`${salaryMonthKey}-01T00:00:00`);
    const monthName = salaryMonth.toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
    const attendanceRows = monthlyAttendance
      .map(
        (item) => `
          <tr>
            <td>${item.date}</td>
            <td>${item.dayType === "paid-sunday" ? "Sunday Paid" : formatTime(item.checkInAt)}</td>
            <td>${item.dayType === "paid-sunday" ? "Sunday Paid" : formatTime(item.checkOutAt)}</td>
            <td>${item.workedHours || 0}</td>
            <td>${item.dayType || item.status || "-"}</td>
            <td>Rs ${item.salaryAmount || 0}</td>
          </tr>
        `
      )
      .join("");
    const leaveRows = monthlyApprovedLeaves
      .map((leave, index) => {
        const isPaidLeave = index === 0;
        return `
          <tr>
            <td>${leave.date}</td>
            <td>-</td>
            <td>-</td>
            <td>0</td>
            <td>${isPaidLeave ? "Paid Leave" : "Unpaid Leave"}</td>
            <td>${isPaidLeave ? `Rs ${roundMoney(dailySalary)}` : `- Rs ${roundMoney(dailySalary)}`}</td>
          </tr>
        `;
      })
      .join("");
    const rows = `${attendanceRows}${leaveRows}`;

    const slipWindow = window.open("", "_blank", "width=900,height=700");
    if (!slipWindow) {
      alert("Popup allow karo, salary slip print window open hogi");
      return;
    }

    slipWindow.document.write(`
      <html>
        <head>
          <title>${user.name} Salary Slip</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            h1, h2, p { margin: 0; }
            .head { display: flex; justify-content: space-between; gap: 16px; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 18px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
            .box { border: 1px solid #d1d5db; padding: 12px; border-radius: 6px; }
            .box span { display: block; color: #6b7280; font-size: 12px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th, td { border: 1px solid #d1d5db; padding: 9px; text-align: left; font-size: 13px; }
            th { background: #f3f4f6; }
            .total { margin-top: 18px; text-align: right; font-size: 20px; font-weight: 800; }
            @media print { button { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="head">
            <div>
              <h1>Salary Slip</h1>
              <p>${monthName}</p>
            </div>
            <button onclick="window.print()">Print</button>
          </div>
          <h2>${user.name}</h2>
          <p>${user.email || ""}</p>
          <div class="grid">
            <div class="box"><span>Monthly Salary</span><strong>Rs ${monthlySalary}</strong></div>
            <div class="box"><span>Join Date</span><strong>${user.joinDate || "-"}</strong></div>
            <div class="box"><span>Daily Salary</span><strong>Rs ${roundMoney(dailySalary)}</strong></div>
            <div class="box"><span>Paid Days</span><strong>${monthlyPaidDays}</strong></div>
            <div class="box"><span>Paid Leave</span><strong>${paidLeaveDays}</strong></div>
            <div class="box"><span>Unpaid Leave</span><strong>${unpaidLeaveDays}</strong></div>
            <div class="box"><span>Gross Pay</span><strong>Rs ${salarySummary.grossSalary}</strong></div>
            <div class="box"><span>Leave Deduction</span><strong>Rs ${salarySummary.otherDeduction}</strong></div>
            <div class="box"><span>Tax Deduction</span><strong>Rs ${salarySummary.taxDeduction}</strong></div>
            <div class="box"><span>PF 12%</span><strong>Rs ${salarySummary.pfDeduction}</strong></div>
            <div class="box"><span>Net Salary</span><strong>Rs ${salarySummary.netSalary}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Day Type</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>${rows || "<tr><td colspan='6'>No attendance found</td></tr>"}</tbody>
          </table>
          <div class="total">Net Salary: Rs ${salarySummary.netSalary}</div>
        </body>
      </html>
    `);
    slipWindow.document.close();
    slipWindow.focus();
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Employee Dashboard</h2>
            <p>{user.name} salary and attendance</p>
          </div>
          <span className="clock">{now.toLocaleTimeString()}</span>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span>Monthly Salary</span>
            <strong>Rs {monthlySalary || 0}</strong>
          </div>
          <div className="stat-card">
            <span>Hourly Rate</span>
            <strong>Rs {roundMoney(hourlySalary)}</strong>
          </div>
          <div className="stat-card">
            <span>Daily Salary</span>
            <strong>Rs {roundMoney(dailySalary)}</strong>
          </div>
          <div className="stat-card">
            <span>Month Hours</span>
            <strong>{monthlyWorkHours} hr</strong>
          </div>
          <div className="stat-card">
            <span>Today Status</span>
            <strong>
              {activeAttendance
                ? "Checked In"
                : todayLeave
                ? "On Leave"
                : todayAttendance?.checkOutAt
                ? "Completed"
                : "Not Started"}
            </strong>
          </div>
          <div className="stat-card">
            <span>Today Salary</span>
            <strong>Rs {todayAttendance?.salaryAmount || 0}</strong>
          </div>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "attendance" ? "active-tab" : ""}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>
          <button
            className={activeTab === "leave" ? "active-tab" : ""}
            onClick={() => setActiveTab("leave")}
          >
            Leave
          </button>
          <button className="print-btn" onClick={handlePrintSalarySlip}>
            Print Salary Slip
          </button>
          <input
            className="month-picker"
            type="month"
            value={selectedMonth}
            min={joinMonthKey || undefined}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>

        {activeTab === "attendance" && (
          <div className="attendance-box">
            {todayLeave && !activeAttendance ? (
              <div className="leave-day-note">
                <strong>On Leave</strong>
                <span>Check in is closed for today's leave request.</span>
              </div>
            ) : (
              <button className="attendance-btn" onClick={handleAttendance}>
                {activeAttendance ? "Check Out" : "Check In"}
              </button>
            )}

            <div className="attendance-details">
              <div>
                <span>Check In</span>
                <strong>{formatTime(todayAttendance?.checkInAt)}</strong>
              </div>
              <div>
                <span>Check Out</span>
                <strong>{formatTime(todayAttendance?.checkOutAt)}</strong>
              </div>
              <div>
                <span>Worked Hours</span>
                <strong>{todayAttendance?.workedHours || 0} hr</strong>
              </div>
              <div>
                <span>Overtime</span>
                <strong>{todayAttendance?.overtimeHours || 0} hr</strong>
              </div>
              <div>
                <span>Day Type</span>
                <strong>{todayAttendance?.dayType || todayAttendance?.status || "-"}</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leave" && (
          <div className="leave-box">
            <div className="employee-form two-column">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <button className="primary-btn" onClick={handleApply}>
              Apply Leave
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="stat-grid">
          <div className="stat-card">
            <span>Total Leaves</span>
            <strong>{totalLeaves}</strong>
          </div>
          <div className="stat-card">
            <span>Pending</span>
            <strong>{pendingLeaves}</strong>
          </div>
          <div className="stat-card">
            <span>Approved</span>
            <strong>{approvedLeaves}</strong>
          </div>
          <div className="stat-card">
            <span>Paid Leave</span>
            <strong>{paidLeaveDays}</strong>
          </div>
          <div className="stat-card">
            <span>Unpaid Leave</span>
            <strong>{unpaidLeaveDays}</strong>
          </div>
          <div className="stat-card">
            <span>Gross Pay</span>
            <strong>Rs {salarySummary.grossSalary}</strong>
          </div>
          <div className="stat-card">
            <span>Leave Cut</span>
            <strong>Rs {salarySummary.otherDeduction}</strong>
          </div>
          <div className="stat-card">
            <span>Tax Cut</span>
            <strong>Rs {salarySummary.taxDeduction}</strong>
          </div>
          <div className="stat-card">
            <span>PF Cut</span>
            <strong>Rs {salarySummary.pfDeduction}</strong>
          </div>
          <div className="stat-card">
            <span>Net Pay</span>
            <strong>Rs {salarySummary.netSalary}</strong>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Overtime</th>
                <th>Type</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>
              {monthlyAttendance.map((item) => (
                <tr key={item.id}>
                  <td data-label="Date">{item.date}</td>
                  <td data-label="Check In">{item.dayType === "paid-sunday" ? "Sunday Paid" : formatTime(item.checkInAt)}</td>
                  <td data-label="Check Out">{item.dayType === "paid-sunday" ? "Sunday Paid" : formatTime(item.checkOutAt)}</td>
                  <td data-label="Hours">{item.workedHours || 0}</td>
                  <td data-label="Overtime">{item.overtimeHours || 0}</td>
                  <td data-label="Type">{item.dayType || item.status || "-"}</td>
                  <td data-label="Salary">Rs {item.salaryAmount || 0}</td>
                </tr>
              ))}
              {monthlyAttendance.length === 0 && (
                <tr>
                  <td className="table-empty-cell" colSpan="7">No attendance found for selected month</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
