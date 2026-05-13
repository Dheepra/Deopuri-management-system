// Validators are pure functions returning either a string (error message) or null (ok).
// Keep them tiny and composable so any page can re-use them.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;

export const required = (label) => (value) =>
  value == null || String(value).trim() === '' ? `${label} is required` : null;

export const email = (value) =>
  value && !EMAIL_RE.test(value) ? 'Enter a valid email address' : null;

export const minLength = (n) => (value) =>
  value && value.length < n ? `Must be at least ${n} characters` : null;

export const phone10 = (value) =>
  value && !PHONE_RE.test(value) ? 'Phone must be exactly 10 digits' : null;

export const matches = (otherValue, label) => (value) =>
  value !== otherValue ? `Does not match ${label}` : null;

// Run a list of validators in order, return the first error or null.
export const runValidators = (value, ...validators) => {
  for (const fn of validators) {
    const result = fn(value);
    if (result) return result;
  }
  return null;
};
