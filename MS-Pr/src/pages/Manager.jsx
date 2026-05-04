import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaves, updateLeave } from "../features/leave/leaveSlice";
import { fetchUsers } from "../features/users/userSlice";

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

export default function Manager() {
  const dispatch = useDispatch();
  const leaves = useSelector((state) => state.leave.list);
  const users = useSelector((state) => state.users.list);
  const manager = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    dispatch(fetchLeaves());
    dispatch(fetchUsers());
  }, [dispatch]);

  const teamEmployees = useMemo(() => {
    return users.filter((user) => user.managerId === manager?.id);
  }, [manager?.id, users]);

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

  const handleUpdate = (leave, status) => {
    dispatch(updateLeave({ ...leave, status }));
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
        <div className="manager-profile">
          <span>{getInitials(manager?.name || "MG")}</span>
          <div>
            <strong>{manager?.name || "Manager"}</strong>
            <small>{manager?.email || "manager account"}</small>
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
              <div className="member-card" key={employee.id}>
                <span className="avatar">{getInitials(employee.name)}</span>
                <div>
                  <strong>{employee.name}</strong>
                  <small>{employee.field || "Team member"}</small>
                </div>
                <p>Rs {employee.monthlySalary || 0}</p>
              </div>
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
                    <td>
                      <strong>{leave.name}</strong>
                      <span>{leave.email || leave.managerName || "-"}</span>
                    </td>
                    <td>{leave.field || "-"}</td>
                    <td>{leave.date || "-"}</td>
                    <td>{leave.reason || "-"}</td>
                    <td>
                      <span className={getStatusClass(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
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
                    <td colSpan="6">
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
