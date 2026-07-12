import DashboardLayout from './DashboardLayout.jsx';

// Staff console — shared modern shell (dark sidebar on desktop, bottom tab bar on mobile).
const NAV = [
  { label: 'Overview',    to: '/staff/dashboard',   end: true, icon: 'M3 12 12 3l9 9M5 10v10h14V10' },
  { label: 'Attendance',  to: '/staff/attendance',  icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { label: 'My Leaves',   to: '/staff/leaves',      icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
  { label: 'Profile',     to: '/staff/settings',    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1' },
];

export default function StaffDashboardLayout() {
  return <DashboardLayout navItems={NAV} consoleLabel="Staff" />;
}
