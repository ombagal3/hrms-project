import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, error } = useSelector((state) => state.auth);

  const handleLogin = () => {
    dispatch(loginUser({ email, password }));
  };

  // ✅ yaha redirect hoga properly
  useEffect(() => {
    if (user?.role === "admin") navigate("/admin");
    else if (user?.role === "manager") navigate("/manager");
    else if (user?.role === "employee") navigate("/employee");
    localStorage.setItem("user", JSON.stringify(user));
  }, [user, navigate]);

  return (
    <div>
      <h2>Login</h2>

      <input placeholder="email...(emp,mgr)" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="password" type="password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleLogin}>Login</button>

      {error && <p>{error}</p>}
    </div>
  );
}