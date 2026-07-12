import { http } from './http.js';

// Patients are derived from the hospital admin's appointments (whoever books an appointment is a
// patient) — there is no separate patient table, so this is read-only. The backend scopes the list
// to the logged-in hospital admin via the JWT.
export async function getPatients({ signal } = {}) {
  const { data } = await http.get('/deopuri/hospital-admin/patients', { signal });
  return data;
}
