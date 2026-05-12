import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttendance,
  markAttendance,
  updateAttendance
} from "../features/attendance/attendanceSlice";
import { fetchLeaves, updateLeave } from "../features/leave/leaveSlice";
import { fetchUsers } from "../features/users/userSlice";
import {
  calculateSalaryDeductions,
  calculateCheckoutPayroll,
  formatTime,
  getAttendanceTotal,
  getLocalDateKey,
  getMonthKey,
  getPayrollRates,
  normalHours,
  roundMoney
} from "../utils/payroll";
import LogoutButton from "../components/LogoutButton";

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getStatusClass = (status) => {
  if (status === "approved") return "status-badge approved";
  if (status === "rejected") return "status-badge rejected";
  return "status-badge pending";
};

const isCheckoutIncomplete = (item) =>
  item?.status === "checked-in" && !item?.checkOutAt;

export default function Manager() {
  const dispatch = useDispatch();
  const leaves = useSelector((state) => state.leave.list);
  const users = useSelector((state) => state.users.list);
  const attendance = useSelector((state) => state.attendance.list);
  const manager = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );
  const [now, setNow] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [salaryMonth, setSalaryMonth] = useState(getMonthKey());

  useEffect(() => {
    dispatch(fetchLeaves());
    dispatch(fetchUsers());
    dispatch(fetchAttendance());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const teamEmployees = useMemo(() => {
    return users.filter((user) => user.managerId === manager?.id);
  }, [manager?.id, users]);

  const managerAttendance = useMemo(() => {
    return attendance.filter(
      (item) =>
        item.userId === manager?.id ||
        item.email === manager?.email ||
        item.name === manager?.name
    );
  }, [attendance, manager?.email, manager?.id, manager?.name]);

  const teamEmployeeIds = useMemo(
    () => teamEmployees.map((employee) => employee.id),
    [teamEmployees]
  );

  const teamEmployeeEmails = useMemo(
    () => teamEmployees.map((employee) => employee.email),
    [teamEmployees]
  );

  const teamLeaves = useMemo(() => {
    return leaves.filter(
      (leave) =>
        leave.managerId === manager?.id ||
        teamEmployeeIds.includes(leave.userId) ||
        teamEmployeeEmails.includes(leave.email)
    );
  }, [leaves, manager?.id, teamEmployeeEmails, teamEmployeeIds]);

  const pendingLeaves = teamLeaves.filter((leave) => leave.status === "pending");
  const approvedLeaves = teamLeaves.filter((leave) => leave.status === "approved");
  const rejectedLeaves = teamLeaves.filter((leave) => leave.status === "rejected");
  const today = getLocalDateKey();
  const todayAttendance = managerAttendance.find((item) => item.date === today);
  const activeAttendance = managerAttendance.find(
    (item) => item.date === today && item.status === "checked-in"
  );
  const monthlySalary = Number(manager?.monthlySalary || manager?.salary || 0);
  const { dailySalary, hourlySalary } = getPayrollRates(monthlySalary);
  const effectiveSelectedEmployeeId = teamEmployees.some(
    (employee) => employee.id === selectedEmployeeId
  )
    ? selectedEmployeeId
    : teamEmployees[0]?.id || "";
  const selectedEmployee = teamEmployees.find(
    (employee) => employee.id === effectiveSelectedEmployeeId
  );
  const selectedEmployeeSalary = Number(
    selectedEmployee?.monthlySalary || selectedEmployee?.salary || 0
  );
  const selectedEmployeeRates = getPayrollRates(selectedEmployeeSalary);
  const selectedEmployeeAttendance = attendance.filter(
    (item) =>
      (item.userId === selectedEmployee?.id ||
        item.email === selectedEmployee?.email ||
        item.name === selectedEmployee?.name) &&
      item.status !== "paid-sunday" &&
      item.dayType !== "paid-sunday" &&
      String(item.date || "").startsWith(salaryMonth)
  );
  const selectedEmployeeLeaves = leaves.filter(
    (leave) =>
      leave.status === "approved" &&
      (leave.userId === selectedEmployee?.id ||
        leave.email === selectedEmployee?.email ||
        leave.name === selectedEmployee?.name) &&
      String(leave.date || "").startsWith(salaryMonth)
  );
  const selectedPaidLeaveDays = Math.min(1, selectedEmployeeLeaves.length);
  const selectedUnpaidLeaveDays = Math.max(
    0,
    selectedEmployeeLeaves.length - selectedPaidLeaveDays
  );
  const selectedAttendanceSalary = getAttendanceTotal(selectedEmployeeAttendance);
  const selectedWorkedDays = selectedEmployeeAttendance.filter(
    (item) => item.status === "completed"
  ).length;
  const selectedPaidLeaveAmount = roundMoney(
    selectedEmployeeRates.dailySalary * selectedPaidLeaveDays
  );
  const selectedLeaveDeduction = roundMoney(
    selectedEmployeeRates.dailySalary * selectedUnpaidLeaveDays
  );
  const selectedSalarySummary = calculateSalaryDeductions(
    roundMoney(selectedAttendanceSalary + selectedPaidLeaveAmount),
    selectedLeaveDeduction
  );

  const handleUpdate = (leave, status) => {
    dispatch(updateLeave({ ...leave, status }));
  };

  const handleManagerAttendance = () => {
    if (!monthlySalary) {
      alert("Monthly salary admin panel me set karo");
      return;
    }

    const currentTime = new Date();

    if (!activeAttendance) {
      if (todayAttendance) {
        alert("Today attendance already completed");
        return;
      }

      dispatch(
        markAttendance({
          userId: manager.id,
          name: manager.name,
          email: manager.email,
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

  return (
    <main className="manager-shell">
      <section className="manager-hero">
        <div>
          <span className="eyebrow">Manager Workspace</span>
          <h2>{manager?.field || "Team"} Dashboard</h2>
          <p>
            {manager?.name || "Manager"} can review leave requests and monitor
            assigned team members from one place.
          </p>
        </div>
        <div className="manager-profile-wrap">
          <div className="manager-profile">
            <span>{getInitials(manager?.name || "MG")}</span>
            <div>
              <strong>{manager?.name || "Manager"}</strong>
              <small>{manager?.email || "manager account"}</small>
            </div>
          </div>
          <LogoutButton />
        </div>
      </section>

      <section className="manager-attendance-panel">
        <div>
          <span className="eyebrow">Manager Attendance</span>
          <h3>
            {activeAttendance
              ? "Checked In"
              : todayAttendance?.status === "paid-sunday"
              ? "Paid Sunday"
              : todayAttendance
              ? "Completed"
              : "Ready for check in"}
          </h3>
          <p>{now.toLocaleTimeString()} | Daily salary Rs {roundMoney(dailySalary)}</p>
        </div>
        <div className="manager-attendance-actions">
          <button className="attendance-btn" onClick={handleManagerAttendance}>
            {activeAttendance ? "Check Out" : "Check In"}
          </button>
          <div>
            <span>In: {todayAttendance?.dayType === "paid-sunday" ? "Sunday Paid" : formatTime(todayAttendance?.checkInAt)}</span>
            <span>
              Out:{" "}
              {todayAttendance?.dayType === "paid-sunday"
                ? "Sunday Paid"
                : isCheckoutIncomplete(todayAttendance)
                ? "Checkout incomplete"
                : formatTime(todayAttendance?.checkOutAt)}
            </span>
            <strong>Rs {todayAttendance?.salaryAmount || 0}</strong>
          </div>
        </div>
      </section>

      <section className="manager-stats">
        <div className="manager-stat-card primary">
          <span>Team Members</span>
          <strong>{teamEmployees.length}</strong>
          <small>Assigned by admin</small>
        </div>
        <div className="manager-stat-card warning">
          <span>Pending Requests</span>
          <strong>{pendingLeaves.length}</strong>
          <small>Need approval</small>
        </div>
        <div className="manager-stat-card success">
          <span>Approved</span>
          <strong>{approvedLeaves.length}</strong>
          <small>Completed requests</small>
        </div>
        <div className="manager-stat-card danger">
          <span>Rejected</span>
          <strong>{rejectedLeaves.length}</strong>
          <small>Declined requests</small>
        </div>
      </section>

      <section className="manager-grid">
        <div className="manager-panel">
          <div className="manager-panel-head">
            <div>
              <h3>Team Members</h3>
              <p>Employees reporting to this manager</p>
            </div>
            <span>{teamEmployees.length}</span>
          </div>

          <div className="member-list">
            {teamEmployees.map((employee) => (
              <button
                className={`member-card member-card-button ${
                  effectiveSelectedEmployeeId === employee.id ? "selected" : ""
                }`}
                key={employee.id}
                onClick={() => setSelectedEmployeeId(employee.id)}
              >
                <span className="avatar">{getInitials(employee.name)}</span>
                <div>
                  <strong>{employee.name}</strong>
                  <small>{employee.field || "Team member"}</small>
                </div>
                <p>Rs {employee.monthlySalary || 0}</p>
              </button>
            ))}

            {teamEmployees.length === 0 && (
              <div className="empty-state">
                <strong>No team assigned</strong>
                <p>Admin se employee assign karne ke baad yaha list dikhegi.</p>
              </div>
            )}
          </div>
        </div>

        <div className="manager-panel wide">
          <div className="manager-panel-head">
            <div>
              <h3>Employee Salary Detail</h3>
              <p>Click team member and view selected month salary</p>
            </div>
            <input
              className="month-picker"
              type="month"
              value={salaryMonth}
              onChange={(e) => setSalaryMonth(e.target.value)}
            />
          </div>

          {selectedEmployee ? (
            <div className="salary-detail-box">
              <div className="salary-employee-head">
                <span className="avatar">{getInitials(selectedEmployee.name)}</span>
                <div>
                  <strong>{selectedEmployee.name}</strong>
                  <small>{selectedEmployee.email || "-"}</small>
                </div>
              </div>

              <div className="salary-detail-grid">
                <div>
                  <span>Aadhaar</span>
                  <strong>{selectedEmployee.aadhaar || "-"}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{selectedEmployee.phone || "-"}</strong>
                </div>
                <div>
                  <span>Join Date</span>
                  <strong>{selectedEmployee.joinDate || "-"}</strong>
                </div>
                <div>
                  <span>Monthly Salary</span>
                  <strong>Rs {selectedEmployeeSalary}</strong>
                </div>
                <div>
                  <span>Daily Salary</span>
                  <strong>Rs {roundMoney(selectedEmployeeRates.dailySalary)}</strong>
                </div>
                <div>
                  <span>Worked Days</span>
                  <strong>{selectedWorkedDays}</strong>
                </div>
                <div>
                  <span>Attendance Pay</span>
                  <strong>Rs {selectedAttendanceSalary}</strong>
                </div>
                <div>
                  <span>Paid Leave</span>
                  <strong>{selectedPaidLeaveDays}</strong>
                </div>
                <div>
                  <span>Unpaid Leave</span>
                  <strong>{selectedUnpaidLeaveDays}</strong>
                </div>
                <div>
                  <span>Gross Pay</span>
                  <strong>Rs {selectedSalarySummary.grossSalary}</strong>
                </div>
                <div>
                  <span>Leave Cut</span>
                  <strong>Rs {selectedSalarySummary.otherDeduction}</strong>
                </div>
                <div>
                  <span>Tax Cut</span>
                  <strong>Rs {selectedSalarySummary.taxDeduction}</strong>
                </div>
                <div>
                  <span>PF Cut</span>
                  <strong>Rs {selectedSalarySummary.pfDeduction}</strong>
                </div>
                <div className="net-pay-card">
                  <span>Net Pay</span>
                  <strong>Rs {selectedSalarySummary.netSalary}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <strong>No employee selected</strong>
              <p>Team member add hoga to salary detail yaha dikhegi.</p>
            </div>
          )}
        </div>

        <div className="manager-panel wide leave-requests-panel">
          <div className="manager-panel-head">
            <div>
              <h3>Leave Requests</h3>
              <p>Approve or reject only your team requests</p>
            </div>
            <span>{teamLeaves.length}</span>
          </div>

          <div className="manager-table-wrap">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Team</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td data-label="Employee">
                      <strong>{leave.name}</strong>
                      <span>{leave.email || leave.managerName || "-"}</span>
                    </td>
                    <td data-label="Team">{leave.field || "-"}</td>
                    <td data-label="Date">{leave.date || "-"}</td>
                    <td data-label="Reason">{leave.reason || "-"}</td>
                    <td data-label="Status">
                      <span className={getStatusClass(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                    <td data-label="Action">
                      {leave.status === "pending" ? (
                        <div className="approval-actions">
                          <button
                            className="approve-btn"
                            onClick={() => handleUpdate(leave, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleUpdate(leave, "rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="muted-action">Done</span>
                      )}
                    </td>
                  </tr>
                ))}

                {teamLeaves.length === 0 && (
                  <tr>
                    <td className="table-empty-cell" colSpan="6">
                      <div className="empty-state table-empty">
                        <strong>No leave requests</strong>
                        <p>Team employee leave apply karega to yaha request aayegi.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
