import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import img1 from "../image/1.jpg";

function App() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });

  const [firstnames, setFirstNames] = useState("");
  const [lastnames, setLastNames] = useState("");
  const [listData, setListData] = useState([]);

  const handleNavigate = (path, fn, ln, avatar = "") => {
    setFirstNames(fn);
    setLastNames(ln);
    setPhoto(avatar);
    navigate(path, {
      state: {
        firstnames: fn,
        lastnames: ln,
        listdata: listData,
        photo: avatar,
      },
    });
  };

  const validateForm = () => {
    const newErrors = { username: "", password: "" };
    let isValid = true;

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (username.trim().length < 2) {
      newErrors.username = "Username must be at least 2 characters";
      isValid = false;
    }

    // Password validation
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({ username: "", password: "" });

    if (!validateForm()) {
      return;
    }

    // Demo credentials with role-based authentication
    const demoUsers = {
      "admin": { password: "admin", role: "admin", firstName: "Admin", lastName: "User" },
      "staff": { password: "staff", role: "staff", firstName: "Staff", lastName: "User" },
      "doctor": { password: "doctor", role: "doctor", firstName: "Doctor", lastName: "User" },
      // Alternative credentials (backward compatible)
      "Admin": { password: "Admin", role: "admin", firstName: "Admin", lastName: "User" },
      "Staff": { password: "Staff", role: "staff", firstName: "Staff", lastName: "User" },
      "Doctor": { password: "Doctor", role: "doctor", firstName: "Doctor", lastName: "User" },
    };

    // Check if username exists in demo users
    const user = demoUsers[username];

    if (user && user.password === password) {
      // Store authentication info in localStorage
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('role', user.role);
      localStorage.setItem('username', username);
      localStorage.setItem('firstName', user.firstName);
      localStorage.setItem('lastName', user.lastName);

      // Navigate based on role
      if (user.role === 'admin') {
        handleNavigate("/adminpage", user.firstName, user.lastName, "");
      } else if (user.role === 'staff') {
        handleNavigate("/staffpage", user.firstName, user.lastName, "");
      } else if (user.role === 'doctor') {
        handleNavigate("/doctorpage", user.firstName, user.lastName, "");
      }
      return;
    }

    // If demo credentials don't match, try API (for backward compatibility)
    try {
      const res = await fetch("https://reqres.in/api/users");
      const json = await res.json();
      const users = json?.data ?? [];
      setListData(users);

      const match = users.find(
        (u) => u.first_name === username && u.last_name === password
      );

      if (!match) {
        setMessage("Username or Password is incorrect");
        return;
      }

      // For API users, set default role as staff
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('role', 'staff');
      localStorage.setItem('username', match.first_name);
      localStorage.setItem('firstName', match.first_name);
      localStorage.setItem('lastName', match.last_name);

      handleNavigate(
        "/staffpage",
        match.first_name,
        match.last_name,
        match.avatar
      );
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again.");
    }
  };

  return (
    // Use minHeight: '100dvh' to avoid ResizeObserver loops on mobile
    <div className="container-fluid p-0" style={{ minHeight: "100dvh" }}>
      <div className="row g-0 h-100" style={{ minHeight: "100%" }}>
        {/* Left side (full-height image) */}
        <div className="col-md-6 d-none d-md-block p-0" style={{ minHeight: "100%" }}>
          <img
            src={photo || img1}
            alt="Hospital"
            className="w-100 h-100"
            style={{ objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Right side (login) */}
        <div className="col-md-6 d-flex align-items-center justify-content-center login-bg">
          <div
            className="login-box text-center text-dark p-5 rounded shadow-lg"
            style={{
              background: "rgba(255,255,255,0.95)",
              width: "80%",
              maxWidth: "480px",
            }}
          >
            <h2 className="fw-bold mb-3">🏥 Hospital Management System</h2>
            <p className="text-muted mb-4">Group 9</p>

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  id="username"
                  className={`form-control rounded-pill shadow-sm ${errors.username ? 'is-invalid' : ''}`}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors(prev => ({ ...prev, username: "" }));
                  }}
                />
                <label htmlFor="username">Username</label>
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  id="password"
                  className={`form-control rounded-pill shadow-sm ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: "" }));
                  }}
                />
                <label htmlFor="password">Password</label>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              {message && (
                <div className="alert alert-danger py-2">{message}</div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-pill shadow-sm fw-bold"
              >
                LOGIN
              </button>
            </form>

          

            <p className="text-muted mt-3 mb-0">
              Code by <a href="#" className="text-decoration-none">Hospital</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;