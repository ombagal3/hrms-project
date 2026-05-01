// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchLeaves, updateLeave } from "../features/leave/leaveSlice";

// export default function Manager() {
//   const dispatch = useDispatch();
//   const leaves = useSelector((state) => state.leave.list);

//   useEffect(() => {
//     dispatch(fetchLeaves());
//   }, [dispatch]);

//   return (
//     <div>
//       <h2>Manager Panel</h2>

//       {leaves.map((leave) => (
//         <div key={leave.id}>
//           <p>{leave.name} - {leave.date} - {leave.reason} ({leave.status})</p>

//           <button onClick={() =>
//             dispatch(updateLeave({ ...leave, status: "approved" }))
//           }>
//             Approve
//           </button>

//           <button onClick={() =>
//             dispatch(updateLeave({ ...leave, status: "rejected" }))
//           }>
//             Reject
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaves, updateLeave } from "../features/leave/leaveSlice";

export default function Manager() {
  const dispatch = useDispatch();
  const leaves = useSelector((state) => state.leave.list);

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  // 📊 Stats
  const total = leaves.length;
  const pending = leaves.filter(l => l.status === "pending").length;
  const approved = leaves.filter(l => l.status === "approved").length;
  const rejected = leaves.filter(l => l.status === "rejected").length;

  const handleUpdate = (leave, status) => {
    dispatch(updateLeave({ ...leave, status }));
  };

  return (
    <div className="container mt-4">

      <h2 className="mb-3">Manager Dashboard</h2>

      {/* 🔥 CARDS */}
      <div className="row mb-4">

        <div className="col-md-3">
          <div className="card p-3 shadow text-center">
            <h6>Total Requests</h6>
            <h4>{total}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow text-center bg-warning">
            <h6>Pending</h6>
            <h4>{pending}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow text-center bg-success text-white">
            <h6>Approved</h6>
            <h4>{approved}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 shadow text-center bg-danger text-white">
            <h6>Rejected</h6>
            <h4>{rejected}</h4>
          </div>
        </div>

      </div>

      {/* 📋 TABLE */}
      <div className="card p-3 shadow">
        <h5>Leave Requests</h5>

        <table className="table table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.name}</td>
                <td>{leave.date}</td>
                <td>{leave.reason}</td>

                <td>
                  <span
                    className={
                      leave.status === "approved"
                        ? "badge bg-success"
                        : leave.status === "rejected"
                        ? "badge bg-danger"
                        : "badge bg-warning"
                    }
                  >
                    {leave.status}
                  </span>
                </td>

                <td>
                  {leave.status === "pending" ? (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleUpdate(leave, "approved")}
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUpdate(leave, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-muted">No Action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}