// Staffpage.jsx
import React, { useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

export default function Staffpage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Router state (ปลอดภัย) ----
  const state = (location && location.state) || {};
  const f_name = state.firstnames || "Staff";
  const l_name = state.lastnames || "User";
  const photo  = state.photo || "";
  const listData = Array.isArray(state.listdata) ? state.listdata : [];

  // ---- UI state ----
  const [view, setView] = useState("appointments"); // 'patients' | 'billing' | 'inventory' | 'appointments' | 'table'
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");

  // ---- เมนูซ้าย (สไตล์เดียวกับ Doctorpage) ----
  const menu = [
    { key: "patients",   label: "View Patient Information" },
    { key: "billing",    label: "Billing / Take Payment" },
    { key: "inventory",  label: "Manage Inventory" },
    { key: "appointments", label: "View Appointments" },
    { key: "table",      label: "Users Table" },
  ];

  // ---- Derived list ----
  const filteredSortedList = useMemo(() => {
    const copy = [...listData];
    const ft = filterText.trim().toLowerCase();
    const visible = ft
      ? copy.filter(u =>
          ["first_name", "last_name", "email"]
            .some(k => String(u[k] || "").toLowerCase().includes(ft))
        )
      : copy;

    const dir = sortDir === "asc" ? 1 : -1;
    visible.sort((a, b) => {
      const av = String(a?.[sortKey] ?? "");
      const bv = String(b?.[sortKey] ?? "");
      return av.localeCompare(bv) * dir;
    });
    return visible;
  }, [listData, filterText, sortKey, sortDir]);

  const cameWithState = f_name || l_name || photo || listData.length > 0;

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleLogout = () => {
    navigate("/"); // กลับหน้า login/หน้าแรก
  };

  return (
    <div className="doctor-layout">
      {/* Topbar */}
      <header className="doctor-topbar shadow-sm">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <img
              className="brand-icon"
              src="/images/hospital.png"
              alt=""
              onError={(e)=>{e.currentTarget.style.display="none";}}
            />
            <h1 className="h5 m-0 fw-semibold">Hospital Management System</h1>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="small text-muted">Signed in</div>
              <div className="fw-semibold">{f_name} {l_name}</div>
            </div>

            {photo ? (
              <img src={photo} alt="avatar" className="avatar" />
            ) : (
              <div className="avatar placeholder">{(f_name[0] || "S").toUpperCase()}</div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-12 col-md-3 col-lg-2 bg-light-subtle doctor-sidebar border-end">
            <div className="sticky-top pt-3">
              <ListGroup variant="flush" className="doctor-menu">
                {menu.map(item => (
                  <ListGroup.Item
                    key={item.key}
                    action
                    onClick={() => setView(item.key)}
                    className={`menu-item ${view === item.key ? "active" : ""}`}
                  >
                    {item.label}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {!cameWithState && (
                <div className="p-3 small text-warning">
                  No user data. Go back to <Link to="/home">Home</Link> and log in.
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="col-12 col-md-9 col-lg-10 py-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 m-0 text-muted">
                {menu.find(m => m.key === view)?.label || "Dashboard"}
              </h2>
              <div className="text-muted small">
                Total users: {listData.length}
              </div>
            </div>

            {/* Cards per view */}
            {view === "appointments" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Appointments</h5>
                  <p className="text-muted mb-0">
                    
                  </p>
                </div>
              </div>
            )}

            {view === "patients" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Patient Information</h5>
                  <p className="text-muted mb-0">
                    
                  </p>
                </div>
              </div>
            )}

            {view === "billing" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Billing / Take Payment</h5>
                  <p className="text-muted mb-0">
                    
                  </p>
                </div>
              </div>
            )}

            {view === "inventory" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Manage Inventory</h5>
                  <p className="text-muted mb-0">
                  
                  </p>
                </div>
              </div>
            )}

            {view === "table" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter by name or email…"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      style={{ maxWidth: 320 }}
                    />
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th role="button" onClick={() => toggleSort("first_name")}>
                            First Name {sortKey === "first_name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th role="button" onClick={() => toggleSort("last_name")}>
                            Last Name {sortKey === "last_name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th role="button" onClick={() => toggleSort("email")}>
                            Email {sortKey === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSortedList.map((u) => (
                          <tr key={`${u.id}-${u.email}`}>
                            <td>{u.first_name}</td>
                            <td>{u.last_name}</td>
                            <td>{u.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-muted small">
                    Showing {filteredSortedList.length} of {listData.length}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
