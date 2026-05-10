import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addUser,
  deleteUser,
  fetchUsers,
  updateUser
} from "../features/users/userSlice";
import PasswordInput from "../components/PasswordInput";
import { getRoleFromEmail } from "../utils/roleHelper";
import { getLocalDateKey } from "../utils/payroll";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  aadhaar: "",
  dob: "",
  field: "",
  managerId: "",
  monthlySalary: "",
  address: "",
  phone: ""
};

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
  const managerOptions = users.filter((user) => user.role === "manager");
  const todayKey = getLocalDateKey();

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
      "monthlySalary",
      "address",
      "phone"
    ];
    const isEmpty = requiredFields.some((field) => !String(form[field]).trim());

    if (isEmpty) {
      alert("All employee fields are required");
      return;
    }

    if (!passwordRegex.test(form.password)) {
      alert(
        "Password me minimum 8 characters, 1 uppercase, 1 lowercase, 1 number aur 1 special character hona chahiye"
      );
      return;
    }

    if (form.dob > todayKey) {
      alert("DOB me future date select nahi kar sakte");
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

    const role = getRoleFromEmail(form.email);
    const selectedManager = managerOptions.find(
      (manager) => manager.id === form.managerId
    );

    if (role === "employee" && !selectedManager) {
      alert("Employee ke liye manager select karo");
      return;
    }

    const alreadyExists = users.find(
      (user) => user.email === form.email && user.id !== editId
    );

    if (alreadyExists) {
      alert("User already exists");
      return;
    }

    const employeeData = {
      ...form,
      role,
      managerId: role === "employee" ? selectedManager.id : "",
      managerName: role === "employee" ? selectedManager.name : "",
      monthlySalary: Number(form.monthlySalary),
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
      managerId: user.managerId || "",
      monthlySalary: user.monthlySalary || user.salary || "",
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
                <th>Manager</th>
                <th>Monthly Salary</th>
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
                  <td>{user.managerName || "-"}</td>
                  <td>{user.monthlySalary ? `Rs ${user.monthlySalary}` : "-"}</td>
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

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Employee information and monthly salary setup</p>
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
          <PasswordInput
            placeholder="Password: Aa@12345"
            title="Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character"
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
            max={todayKey}
            value={form.dob}
            onChange={(e) => handleChange("dob", e.target.value)}
          />
          <input
            placeholder="Field / Department"
            value={form.field}
            onChange={(e) => handleChange("field", e.target.value)}
          />
          <select
            value={form.managerId}
            onChange={(e) => handleChange("managerId", e.target.value)}
          >
            <option value="">Select manager for employee</option>
            {managerOptions.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} - {manager.field || "Team"}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            placeholder="Monthly Salary"
            value={form.monthlySalary}
            onChange={(e) => handleChange("monthlySalary", e.target.value)}
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
    </main>
  );
}
