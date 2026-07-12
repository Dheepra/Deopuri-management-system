import { http } from './http.js';

// Real, hospital-admin-scoped staff CRUD. The backend derives the owning hospital
// admin from the JWT, so no id is passed. All paths are relative so they go through
// the same origin / Vite proxy (see http.js).

export async function getStaff({ signal } = {}) {
  const { data } = await http.get('/deopuri/hospital-admin/staff', { signal });
  return data;
}

export async function createStaff(payload) {
  const { data } = await http.post('/deopuri/hospital-admin/staff', payload);
  return data;
}

export async function updateStaff(id, payload) {
  const { data } = await http.put(`/deopuri/hospital-admin/staff/${id}`, payload);
  return data;
}

export async function deleteStaff(id) {
  await http.delete(`/deopuri/hospital-admin/staff/${id}`);
}

// Attendance roster for a given day (YYYY-MM-DD): each staff member's PRESENT / LEAVE / ABSENT.
// Works for hospital and medical admins (scoped to their own staff by the backend).
export async function getStaffAttendance(date, { signal } = {}) {
  const url = date
    ? `/deopuri/hospital-admin/staff/attendance?date=${date}`
    : '/deopuri/hospital-admin/staff/attendance';
  const { data } = await http.get(url, { signal });
  return data;
}

// Download the monthly attendance matrix as CSV (payroll). month = "YYYY-MM".
export async function downloadAttendanceCsv(month) {
  const url = month
    ? `/deopuri/hospital-admin/staff/attendance/export?month=${month}`
    : '/deopuri/hospital-admin/staff/attendance/export';
  const res = await http.get(url, { responseType: 'blob' });
  const blobUrl = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `attendance-${month || 'current'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}
