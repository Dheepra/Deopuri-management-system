import { http } from './http.js';

// Current signed-in user's profile.
export async function getProfile() {
  const { data } = await http.get('/deopuri/users/me');
  return data;
}

// Update the editable profile fields (self-scoped by the backend).
export async function updateProfile(id, payload) {
  const { data } = await http.put(`/deopuri/users/${id}`, payload);
  return data;
}

// Upload a new profile photo (multipart; field name "image").
// Do NOT set Content-Type manually — let the browser add the multipart boundary.
export async function uploadProfilePhoto(id, file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await http.post(`/deopuri/users/${id}/photo`, formData);
  return data;
}
