import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addUser,
  deleteUser,
  fetchUsers,
  updateUser
} from "../features/users/userSlice";
import { getRoleFromEmail } from "../utils/roleHelper";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  aadhaar: "",
  dob: "",
  field: "",
  hourlySalary: "",
  address: "",
  phone: ""
};

export default function Admin() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.list);

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 5;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = `${user.name} ${user.email} ${user.field || ""}`;
      return searchText.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, users]);

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const requiredFields = [
      "name",
      "email",
      "password",
      "aadhaar",
      "dob",
      "field",
      "hourlySalary",
      "address",
      "phone"
    ];
    const isEmpty = requiredFields.some((field) => !String(form[field]).trim());

    if (isEmpty) {
      alert("All employee fields are required");
      return;
    }

    if (
      !form.email.startsWith("emp") &&
      !form.email.startsWith("mgr") &&
      form.email !== "admin@gmail.com"
    ) {
      alert("Email must start with emp or mgr");
      return;
    }

    const alreadyExists = users.find(
      (user) => user.email === form.email && user.id !== editId
    );

    if (alreadyExists) {
      alert("User already exists");
      return;
    }

    const role = getRoleFromEmail(form.email);
    const employeeData = {
      ...form,
      role,
      hourlySalary: Number(form.hourlySalary),
      aadhaar: form.aadhaar.trim(),
      phone: form.phone.trim()
    };

    if (editId) {
      dispatch(updateUser({ ...employeeData, id: editId }));
      setEditId(null);
    } else {
      dispatch(addUser(employeeData));
    }

    setForm(emptyForm);
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: user.password || "",
      aadhaar: user.aadhaar || "",
      dob: user.dob || "",
      field: user.field || "",
      hourlySalary: user.hourlySalary || "",
      address: user.address || "",
      phone: user.phone || ""
    });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Employee information and hourly salary setup</p>
          </div>
          <span className="count-pill">{users.length} users</span>
        </div>

        <div className="employee-form">
          <input
            placeholder="Employee name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <input
            placeholder="Email emp... or mgr..."
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          <input
            placeholder="Aadhaar number"
            value={form.aadhaar}
            onChange={(e) => handleChange("aadhaar", e.target.value)}
          />
          <input
            type="date"
            value={form.dob}
            onChange={(e) => handleChange("dob", e.target.value)}
          />
          <input
            placeholder="Field / Department"
            value={form.field}
            onChange={(e) => handleChange("field", e.target.value)}
          />
          <input
            type="number"
            min="0"
            placeholder="Salary per hour"
            value={form.hourlySalary}
            onChange={(e) => handleChange("hourlySalary", e.target.value)}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <textarea
            placeholder="Address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>

        <div className="actions">
          <button className="primary-btn" onClick={handleSubmit}>
            {editId ? "Update Employee" : "Save Employee"}
          </button>
          {editId && (
            <button className="ghost-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Employee List</h2>
            <p>Search, edit, or delete saved employee records</p>
          </div>
          <input
            className="search-box"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Field</th>
                <th>Hourly Salary</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </td>
                  <td>{user.role}</td>
                  <td>{user.field || "-"}</td>
                  <td>{user.hourlySalary ? `Rs ${user.hourlySalary}` : "-"}</td>
                  <td>{user.phone || "-"}</td>
                  <td>
                    <button className="small-btn" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => dispatch(deleteUser(user.id))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                className={currentPage === index + 1 ? "active-page" : ""}
                key={index}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
