import { http } from './http.js';

// Doctor self-service portal API (auth = DOCTOR role; JWT auto-attached by http).

export async function getMyLeaves({ signal } = {}) {
  const { data } = await http.get('/deopuri/doctor/leaves', { signal });
  return data;
}

export async function applyLeave(payload) {
  const { data } = await http.post('/deopuri/doctor/leaves', payload);
  return data;
}

export async function getLeaveBalance({ signal } = {}) {
  const { data } = await http.get('/deopuri/doctor/leave-balance', { signal });
  return data;
}
