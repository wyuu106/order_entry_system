import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api_util";
import { getErrorMessage } from "../../utils/error_util";

import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const loginData = new URLSearchParams();

      loginData.append("username", formData.id.trim());

      loginData.append("password", formData.password);

      const response = await axios.post(
        `${API_URL}/login`, loginData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);
      navigate("/orders");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <img src="/logo.png" alt="" />
      </div>

      <div className="auth-container">
        <h2 className="auth-title">ログイン</h2>

        <br />

        {location.state?.message && (
          <p className="auth-success">{location.state.message}</p>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="text"
            name="id"
            placeholder="ID"
            value={formData.id}
            onChange={handleChange}
            autoComplete="username"
            aria-label="ログインID"
          />

          <input
            type="password"
            name="password"
            placeholder="パスワード"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            aria-label="パスワード"
          />

          {errorMessage && (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button className="auth-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中…" : "ログイン"}
          </button>
        </form>

        <Link className="auth-link" to="/register">
          新規登録はこちら
        </Link>
      </div>
    </div>
  );
}

export default Login;
