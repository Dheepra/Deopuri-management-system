import { http } from './http.js';
import { fromBackendRole } from '../auth/roles.js';

// -------------------- ERROR NORMALIZER --------------------
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
    return {
      type: 'network',
      message: 'Could not reach the server. Check your connection.',
    };
  }

  return {
    type: 'unknown',
    message: err?.message ?? 'Unexpected error',
  };
}

// -------------------- SIGN UP --------------------
export async function signUp(payload) {
  try {
    const { data } = await http.post('/api/auth/register', payload);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------- SIGN IN (FIXED) --------------------
export async function signIn({ email, password }) {
  try {
    const { data } = await http.post('/api/auth/login', {
      email,
      password,
    });

    console.log("LOGIN RESPONSE =", data);

    return {
      token: data?.token,

      // IMPORTANT FIX (safe mapping)
      status: data?.status,              // FIRST_TIME_LOGIN / SUCCESS
      userId: data?.userId || data?.id,  // backend compatibility fix

      role: fromBackendRole(data?.role),

      user: {
        id: data?.user?.id || data?.id,
        email: data?.user?.email || email,
        backendRole: data?.user?.backendRole || data?.role,
      },
    };

  } catch (err) {
    throw normalizeError(err);
  }
}

// -------------------- ADMIN FUNCTIONS --------------------
export async function getPendingUsers() {
  try {
    const { data } = await http.get('/api/admin/users/pending');
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function approveUser(id) {
  try {
    const { data } = await http.put(`/api/admin/users/${id}/approve`);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function rejectUser(id) {
  try {
    const { data } = await http.put(`/api/admin/users/${id}/reject`);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}