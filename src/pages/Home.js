import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import img1 from "../image/1.jpg";

function Homepage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [photo, setPhoto] = useState("");

  // Form validation
  const validateForm = () => {
    const newErrors = { username: "", password: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (username.trim().length < 2) {
      newErrors.username = "Username must be at least 2 characters";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 3) {
      newErrors.password = "Password must be at least 3 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({ username: "", password: "" });

    if (!validateForm()) return;

    // Backend login
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Username or password is incorrect");
        return;
      }

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      localStorage.setItem("firstName", data.firstName || "");
      localStorage.setItem("lastName", data.lastName || "");

      navigateByRole(data);
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again.");
    }
  };

  // Navigate by role
  const navigateByRole = (user) => {
    const state = { firstName: user.firstName, lastName: user.lastName };
    if (user.role === "admin") navigate("/adminpage", { state });
    else if (user.role === "staff") navigate("/staffpage", { state });
    else if (user.role === "doctor") navigate("/doctorpage", { state });
  };

  return (
    <div className="container-fluid p-0" style={{ minHeight: "100dvh" }}>
      <div className="row g-0 h-100" style={{ minHeight: "100%" }}>
        {/* Left side (image) */}
        <div className="col-md-6 d-none d-md-block p-0" style={{ minHeight: "100%" }}>
          <img
            src={photo || img1}
            alt="Hospital"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Right side (login form) */}
        <div className="col-md-6 d-flex align-items-center justify-content-center login-bg">
          <div
            className="login-box text-center text-dark p-5 rounded shadow-lg"
            style={{ background: "rgba(255,255,255,0.95)", width: "80%", maxWidth: "480px" }}
          >
            <h2 className="fw-bold mb-3">🏥 Hospital Management System</h2>
            <p className="text-muted mb-4">Group 9</p>

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  id="username"
                  className={`form-control rounded-pill shadow-sm ${errors.username ? "is-invalid" : ""}`}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: "" }));
                  }}
                />
                <label htmlFor="username">Username</label>
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  id="password"
                  className={`form-control rounded-pill shadow-sm ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />
                <label htmlFor="password">Password</label>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              {message && <div className="alert alert-danger py-2">{message}</div>}

              <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill shadow-sm fw-bold">
                LOGIN
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
