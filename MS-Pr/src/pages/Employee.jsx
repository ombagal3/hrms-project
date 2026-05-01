// import { useDispatch } from "react-redux";
// import { applyLeave } from "../features/leave/leaveSlice";
// import { useState } from "react";
// import {  markAttendance, updateAttendance  } from "../features/attendance/attendanceSlice";

// import { fetchAttendance } from "../features/attendance/attendanceSlice";
// import { useEffect } from "react";





// export default function Employee() {
//   const dispatch = useDispatch();

//   const [date, setDate] = useState("");
//   const [reason, setReason] = useState("");
//   const [activeTab, setActiveTab] = useState("leave");

// const user = JSON.parse(localStorage.getItem("user"));
// const attendance = useSelector((state) => state.attendance.list);

// if (!user) {
//   return <h3>Please login again</h3>;
// }

  

//   const handleApply = () => {
//     dispatch(applyLeave({
//       name: user.name,
//       date,
//       reason,
//       status: "pending"
//     }));
//   };
  

// const handleCheckIn = () => {
//   const today = new Date().toLocaleDateString();

//   const already = attendance.find(
//     (a) => a.name === user.name && a.date === today
//   );

//   if (already) {
//     alert("Already checked in today");
//     return;
//   }

//   dispatch(markAttendance({
//     name: user.name,
//     date: today,
//     checkIn: new Date().toLocaleTimeString(),
//     checkOut: ""
//   }));
// };
  

// const handleCheckOut = () => {
//   const today = new Date().toLocaleDateString();

//   const record = attendance.find(
//     (a) => a.name === user.name && a.date === today && !a.checkOut
//   );

//   if (!record) {
//     alert("No check-in found");
//     return;
//   }

//   dispatch(updateAttendance({
//     ...record,
//     checkOut: new Date().toLocaleTimeString()
//   }));
// };

//   return (

//      <div className="container mt-3">
//       <h2>Employee Dashboard</h2>

//       {/* 🔥 TABS */}
//       <div className="mb-3">
//         <button
//           className="btn btn-primary me-2"
//           onClick={() => setActiveTab("leave")}
//         >
//           Leave
//         </button>

//         <button
//           className="btn btn-secondary"
//           onClick={() => setActiveTab("attendance")}
//         >
//           Attendance
//         </button>
//       </div>

//       {/* 🔁 TAB CONTENT */}
//       {activeTab === "leave" && (
//         <div>
//           <h4>Leave Section</h4>
//          <input type="date" onChange={(e) => setDate(e.target.value)} />
//       <input placeholder="Reason" onChange={(e) => setReason(e.target.value)} />

//       <button onClick={handleApply}>Apply Leave</button>
//         </div>
//       )}

//       {activeTab === "attendance" && (
//         <div>
//           <h4>Attendance Section</h4>
//        <button onClick={()=> handleCheckIn()} className="btn btn-primary">CheckIn</button>
//        <button onClick={()=> handleCheckOut()}  className="btn btn-secondary">CheckOut</button>
        
//         </div>
        
//       )}
//     </div>
  
  
//   );
// }

import { useDispatch, useSelector } from "react-redux"; // ✅ FIX
import { applyLeave ,  fetchLeaves } from "../features/leave/leaveSlice";
import { useState, useEffect } from "react";
import {
  markAttendance,
  updateAttendance,
  fetchAttendance
} from "../features/attendance/attendanceSlice";


export default function Employee() {
  const dispatch = useDispatch();

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("leave");

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Redux se attendance data
  const attendance = useSelector((state) => state.attendance.list);

  // ✅ data load
  useEffect(() => {
    dispatch(fetchAttendance());
     dispatch(fetchLeaves());
  }, [dispatch]);

  if (!user) {
    return <h3>Please login again</h3>;
  }

  // 🔽 LEAVE
  const handleApply = () => {
    dispatch(
      applyLeave({
        name: user.name,
        date,
        reason,
        status: "pending"
      })
    );
  };

  // 🔽 CHECK-IN
  const handleCheckIn = () => {
    const today = new Date().toLocaleDateString();

    const already = attendance.find(
      (a) => a.name === user.name && a.date === today
    );

    if (already) {
      alert("Already checked in today");
      return;
    }

    dispatch(
      markAttendance({
        name: user.name,
        date: today,
        checkIn: new Date().toLocaleTimeString(),
        checkOut: ""
      })
    );
  };

  // 🔽 CHECK-OUT
  const handleCheckOut = () => {
    const today = new Date().toLocaleDateString();

    const record = attendance.find(
      (a) => a.name === user.name && a.date === today && !a.checkOut
    );

    if (!record) {
      alert("No check-in found");
      return;
    }

    dispatch(
      updateAttendance({
        ...record,
        checkOut: new Date().toLocaleTimeString()
      })
    );



  };


  const leaves = useSelector((state) => state.leave.list);


  const myLeaves = leaves.filter(l => l.name === user.name);

const totalLeaves = myLeaves.length;
const pendingLeaves = myLeaves.filter(l => l.status === "pending").length;
const approvedLeaves = myLeaves.filter(l => l.status === "approved").length;

const today = new Date().toISOString().split("T")[0];

const todayAttendance = attendance.find(
  (a) => a.name === user.name && a.date === today
);

  return (



    
    <div className="container mt-3">
      <h2>Employee Dashboard</h2>

      {/* TABS */}
      <div className="mb-3">
        <button
          className="btn btn-primary me-2"
          onClick={() => setActiveTab("leave")}
        >
          Leave
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
      </div>

      {/* LEAVE */}
      {activeTab === "leave" && (
        <div>
          <h4>Leave Section</h4>

          <input
            type="date"
            className="form-control mb-2"
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            placeholder="Reason"
            className="form-control mb-2"
            onChange={(e) => setReason(e.target.value)}
          />

          <button className="btn btn-success" onClick={handleApply}>
            Apply Leave
          </button>
        </div>
      )}

      {/* ATTENDANCE */}
      {activeTab === "attendance" && (
        <div>
          <h4>Attendance Section</h4>

          <button className="btn btn-primary me-2" onClick={()=>handleCheckIn()}>
            Check In
          </button>

          <button className="btn btn-danger" onClick={()=>handleCheckOut()}>
            Check Out
          </button>
        </div>
      )}



      <div className="row mb-4 mt-4">

  <div className="col-md-3">
    <div className="card p-3 shadow text-center">
      <h6>Total Leaves</h6>
      <h4>{totalLeaves}</h4>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow text-center bg-warning">
      <h6>Pending</h6>
      <h4>{pendingLeaves}</h4>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow text-center bg-success text-white">
      <h6>Approved</h6>
      <h4>{approvedLeaves}</h4>
    </div>
  </div>

  <div className="col-md-3">
    <div className="card p-3 shadow text-center bg-info text-white">
      <h6>Today Attendance</h6>
      <h5>
        {todayAttendance
          ? todayAttendance.checkOut
            ? "Completed"
            : "Checked In"
          : "Absent"}
      </h5>
    </div>
  </div>

</div>
    </div>
  );
}