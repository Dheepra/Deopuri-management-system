import { http } from './http.js';

// Resolve the logged-in doctor's id from their user session, then their appointments.
function currentUserId() {
  const session = JSON.parse(localStorage.getItem('auth.session') || '{}');
  return session.userId;
}

export async function getMyDoctorId() {
  const userId = currentUserId();
  const { data } = await http.get(`/deopuri/hospital-admin/doctors/me?userId=${userId}`);
  return data.id;
}

// All appointments assigned to the logged-in doctor.
export async function getMyAppointments() {
  const doctorId = await getMyDoctorId();
  const { data } = await http.get(`/deopuri/appointments/doctor/${doctorId}`);
  return data;
}

// Update an appointment's status (e.g. mark COMPLETED once the patient has been seen).
export async function setAppointmentStatus(appointmentId, status) {
  const { data } = await http.patch(
    `/deopuri/appointments/${appointmentId}/status?status=${status}`
  );
  return data;
}
