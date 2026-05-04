import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import { loginUser } from "../features/auth/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, error } = useSelector((state) => state.auth);

  const handleLogin = () => {
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (!user) return;

    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") navigate("/admin");
    else if (user.role === "manager") navigate("/manager");
    else if (user.role === "employee") navigate("/employee");
  }, [user, navigate]);

  return (
    <div className="login-page">
      <div className="bubble-layer" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="login-card">
        <div className="login-brand">
          <span className="brand-logo">H</span>
          <div>
            <h2>HRMS Login</h2>
            <p>Admin, manager, or employee access</p>
          </div>
        </div>

        <label>Email</label>
        <input
          placeholder="admin@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
