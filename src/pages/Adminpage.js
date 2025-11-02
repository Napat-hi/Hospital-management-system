// Adminpage.jsx

// Purin's Page

import React, { useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

export default function Adminpage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Router state (ปลอดภัย) ----
  const state = (location && location.state) || {};
  const f_name = state.firstnames || "Admin";
  const l_name = state.lastnames || "User";
  const photo  = state.photo || "";
  const listData = Array.isArray(state.listdata) ? state.listdata : [];

  // ---- UI state ----
  const [view, setView] = useState("create"); // 'create' | 'add' | 'delete' | 'edit' | 'table'
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");

  // ---- เมนูซ้าย ----
  const menu = [
    { key: "create", label: "Create" },
    { key: "add",    label: "Add" },
    { key: "delete", label: "Delete" },
    { key: "edit",   label: "Edit" },
    { key: "table",  label: "Users Table" },
  ];

  // ---- ตาราง users (เหมือนหน้าอื่น) ----
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
              <div className="avatar placeholder">{(f_name[0] || "A").toUpperCase()}</div>
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

            {/* === ADMIN VIEWS === */}
            {view === "create" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Create</h5>
                  <p className="text-muted mb-3">
                    
                  </p>
                  <form className="row gy-2 gx-2">
                    <div className="col-md-4">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" placeholder="e.g. New Item" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Type</label>
                      <select className="form-select">
                        <option>User</option>
                        <option>Role</option>
                        <option>Department</option>
                      </select>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button type="button" className="btn btn-primary w-100">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {view === "add" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Add</h5>
                  <p className="text-muted mb-3">
                    
                  </p>
                  <form className="row gy-2 gx-2">
                    <div className="col-md-6">
                      <label className="form-label">Target</label>
                      <input type="text" className="form-control" placeholder="Search target..." />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Action</label>
                      <select className="form-select">
                        <option>Add Permission</option>
                        <option>Add Member</option>
                        <option>Attach Role</option>
                      </select>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button type="button" className="btn btn-success w-100">Add</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {view === "delete" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Delete</h5>
                  <p className="text-muted mb-3">
                    
                  </p>
                  <form className="row gy-2 gx-2">
                    <div className="col-md-8">
                      <label className="form-label">Select Item</label>
                      <input type="text" className="form-control" placeholder="Search item to delete..." />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button type="button" className="btn btn-outline-danger w-100">Delete</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {view === "edit" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Edit</h5>
                  <p className="text-muted mb-3">
                    (แก้ไข resource — ตัวอย่างฟอร์มแก้ไขชื่อ/ประเภท)
                  </p>
                  <form className="row gy-2 gx-2">
                    <div className="col-md-5">
                      <label className="form-label">Item</label>
                      <input type="text" className="form-control" placeholder="Search item..." />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">New Name</label>
                      <input type="text" className="form-control" placeholder="New name..." />
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <button type="button" className="btn btn-warning w-100">Update</button>
                    </div>
                  </form>
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
