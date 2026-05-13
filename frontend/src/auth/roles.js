// Frontend role concept — independent of backend's UserRole enum so we can grow
// without touching every consumer.
export const ROLES = Object.freeze({
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  MEDICAL_ADMIN: 'MEDICAL_ADMIN',
});

// Backend UserRole.name() → frontend role. Extend here when new roles ship.
const BACKEND_TO_FRONTEND = Object.freeze({
  ADMIN: ROLES.COMPANY_ADMIN,
  HOSPITAL_ADMIN: ROLES.HOSPITAL_ADMIN,
  MEDICAL: ROLES.MEDICAL_ADMIN,
});

// Frontend role → backend UserRole enum value sent in API bodies.
const FRONTEND_TO_BACKEND = Object.freeze({
  [ROLES.COMPANY_ADMIN]: 'ADMIN',
  [ROLES.HOSPITAL_ADMIN]: 'HOSPITAL_ADMIN',
  [ROLES.MEDICAL_ADMIN]: 'MEDICAL',
});

export function fromBackendRole(role) {
  return BACKEND_TO_FRONTEND[role] ?? null;
}

export function toBackendRole(role) {
  return FRONTEND_TO_BACKEND[role] ?? null;
}

// Roles selectable in the public signup. COMPANY_ADMIN is omitted on purpose —
// that role is seeded manually by an administrator on the database side.
export const PUBLIC_SIGNUP_ROLES = Object.freeze([
  ROLES.HOSPITAL_ADMIN,
  ROLES.MEDICAL_ADMIN,
]);

export const ROLE_LABELS = Object.freeze({
  [ROLES.COMPANY_ADMIN]: 'Company Admin',
  [ROLES.HOSPITAL_ADMIN]: 'Hospital Admin',
  [ROLES.MEDICAL_ADMIN]: 'Medical Admin',
});

// Each console exposes its landing path; LoginForm uses this to redirect by role.
export const ROLE_HOME = Object.freeze({
  [ROLES.COMPANY_ADMIN]: '/admin/dashboard',
  [ROLES.HOSPITAL_ADMIN]: '/hospital/dashboard',
  [ROLES.MEDICAL_ADMIN]: '/medical/dashboard',
});
