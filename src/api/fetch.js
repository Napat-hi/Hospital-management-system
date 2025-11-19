const API_BASE = "http://localhost:5000/api";

// Get all staff
export async function getStaff() {
  const res = await fetch(`${API_BASE}/staff`);
  return res.json();
}

// Disable staff
export async function disableStaff(id) {
  const res = await fetch(`${API_BASE}/staff/${id}/disable`, { method: "PATCH" });
  return res.json();
}

// Activate staff
export async function activateStaff(id) {
  const res = await fetch(`${API_BASE}/staff/${id}/activate`, { method: "PATCH" });
  return res.json();
}
