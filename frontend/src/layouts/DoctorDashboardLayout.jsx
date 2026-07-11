import DashboardLayout from './DashboardLayout.jsx';

// Doctor console now uses the shared modern shell (dark sidebar on desktop, app-style bottom tab bar
// on mobile) instead of a bespoke fixed-width sidebar that broke on phones.
const NAV = [
  { label: 'Overview',      to: '/doctor/dashboard',     end: true, icon: 'M3 12 12 3l9 9M5 10v10h14V10' },
  { label: 'Appointments',  to: '/doctor/appointments',  icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
  { label: 'Patients',      to: '/doctor/patients',      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { label: 'Prescriptions', to: '/doctor/prescriptions', icon: 'M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1zM9 12h6M9 16h4' },
  { label: 'Reports',       to: '/doctor/reports',       icon: 'M3 3v18h18M8 14v4M13 9v9M18 5v13' },
  { label: 'Profile',       to: '/doctor/profile',       icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1' },
];

export default function DoctorDashboardLayout() {
  return <DashboardLayout navItems={NAV} consoleLabel="Doctor" />;
}
