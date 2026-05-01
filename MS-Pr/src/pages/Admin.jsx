// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUsers, addUser, deleteUser } from "../features/users/userSlice";
// import { getRoleFromEmail } from "../utils/roleHelper";

// export default function Admin() {
//   const dispatch = useDispatch();
//   const users = useSelector((state) => state.users.list);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   useEffect(() => {
//     dispatch(fetchUsers());
//   }, [dispatch]);

//   const handleAdd = () => {

//          if (!name || !email || !password) {
//     alert("All fields are required");
//     return;
//   }

//   // ✅ 2. Email validation (IMPORTANT)
//   if (!email.startsWith("emp") && !email.startsWith("mgr")) {
//     alert("Email must start with 'emp' (employee) or 'mgr' (manager)");
//     return;
//   }

//   // ✅ 3. Gmail check (optional but good)
//   if (!email.includes("@gmail.com")) {
//     alert("Only Gmail allowed");
//     return;
//   }


//   const isExist = users.find((u) => u.email === email);

// if (isExist) {
//   alert("User already exists");
//   return;
// }

        
//     const role = getRoleFromEmail(email);

//     const newUser = {
//       name,
//       email,
//       password,
//       role
//     };

//     dispatch(addUser(newUser));

// setName("");
//   setEmail("");
//   setPassword("");

//   };

//   return (
//     <div>
//       <h2>Admin Panel</h2>

//       <h3>Add User</h3>
//       <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
//       <input placeholder="Email (emp...)" onChange={(e) => setEmail(e.target.value)} />
//       <input placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

//       <button onClick={handleAdd}>Add User</button>

//       <h3>User List</h3>
//       {users.map((u) => (
//         <div key={u.id}>
//           {u.name} - {u.email} ({u.role})
//           <button onClick={() => dispatch(deleteUser(u.id))}>Delete</button>
//         </div>
//       ))}
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  addUser,
  deleteUser,
  updateUser
} from "../features/users/userSlice";
import { getRoleFromEmail } from "../utils/roleHelper";

export default function Admin() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.list);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // 🔍 Filter
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 Pagination
  const indexLast = currentPage * usersPerPage;
  const indexFirst = indexLast - usersPerPage;
  const currentUsers = filtered.slice(indexFirst, indexLast);

  const handleSubmit = () => {
    if (!form.email.startsWith("emp") && !form.email.startsWith("mgr")) {
      alert("Invalid email format");
      return;
    }

    const role = getRoleFromEmail(form.email);

    if (editId) {
      dispatch(updateUser({ ...form, role, id: editId }));
      setEditId(null);
    } else {
      dispatch(addUser({ ...form, role }));
    }

    setForm({ name: "", email: "", password: "" });
  };

  const handleEdit = (user) => {
    setForm(user);
    setEditId(user.id);
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      {/* FORM */}
      <div className="card p-3 mb-3">
        <input
          className="form-control mb-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Email...(emp,mgr)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn btn-primary" onClick={handleSubmit}>
          {editId ? "Update User" : "Add User"}
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="form-control mb-3"
        placeholder="Search user..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {currentUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleEdit(u)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => dispatch(deleteUser(u.id))}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div>
        {Array.from({
          length: Math.ceil(filtered.length / usersPerPage)
        }).map((_, i) => (
          <button
            key={i}
            className="btn btn-sm btn-secondary me-1"
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}