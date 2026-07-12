import { http } from './http.js';

// Staff self-service portal API (auth = STAFF role; JWT auto-attached by http).

export async function getMe({ signal } = {}) {
  const { data } = await http.get('/deopuri/staff/me', { signal });
  return data;
}

export async function getDashboard({ signal } = {}) {
  const { data } = await http.get('/deopuri/staff/dashboard', { signal });
  return data;
}

// POST with no body — marks today's attendance.
export async function markAttendance() {
  const { data } = await http.post('/deopuri/staff/attendance');
  return data;
}

export async function getMyAttendance({ signal } = {}) {
  const { data } = await http.get('/deopuri/staff/attendance', { signal });
  return data;
}

export async function getLeaveBalance({ signal } = {}) {
  const { data } = await http.get('/deopuri/staff/leave-balance', { signal });
  return data;
}

export async function applyLeave(payload) {
  const { data } = await http.post('/deopuri/staff/leaves', payload);
  return data;
}

export async function getMyLeaves({ signal } = {}) {
  const { data } = await http.get('/deopuri/staff/leaves', { signal });
  return data;
}
