import { http } from './http.js';

// Hospital-admin leave approval API (auth = HOSPITAL_ADMIN; JWT auto-attached by http).

export async function getLeaves({ signal } = {}) {
  const { data } = await http.get('/deopuri/hospital-admin/leaves', { signal });
  return data;
}

// status = 'APPROVED' | 'REJECTED'
export async function updateLeaveStatus(id, status) {
  const { data } = await http.patch(
    `/deopuri/hospital-admin/leaves/${id}/status?status=${status}`
  );
  return data;
}
