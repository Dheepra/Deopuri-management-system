import { http } from './http.js';
import { fromBackendRole } from '../auth/roles.js';

// Backend ErrorResponse: { timestamp, status, error, message, path, fieldErrors[] }
function normalizeError(err) {
  if (err?.response) {
    const { status, data } = err.response;
    return {
      type: 'api',
      status,
      code: data?.error ?? 'unknown',
      message: data?.message ?? 'Something went wrong',
      fieldErrors: Array.isArray(data?.fieldErrors) ? data.fieldErrors : [],
    };
  }
  if (err?.request) {
    return { type: 'network', message: 'Could not reach the server. Check your connection.' };
  }
  return { type: 'unknown', message: err?.message ?? 'Unexpected error' };
}

export async function signUp(payload) {
  try {
    const { data } = await http.post('/api/auth/register', payload);
    return data; // UserResponse — no token; account is PENDING approval
  } catch (err) {
    throw normalizeError(err);
  }
}

// Returns a session shape that AuthContext consumes directly.
export async function signIn({ email, password }) {
  try {
    const { data } = await http.post('/api/auth/login', { email, password });
    return {
      token: data?.token,
      role: fromBackendRole(data?.role),
      user: { email, backendRole: data?.role },
    };
  } catch (err) {
    throw normalizeError(err);
  }
}
