import DashboardLayout from './DashboardLayout.jsx';

const NAV = [
  { label: 'Dashboard', to: '/medical/dashboard', icon: 'M3 12 12 3l9 9M5 10v10h14V10', end: true },
  { label: 'Catalog',   to: '/medical/catalog',   icon: 'M3 7h18M5 7v13h14V7M9 11h6' },
  { label: 'Inventory', to: '/medical/inventory', icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Billing',   to: '/medical/billing',   icon: 'M9 2h6a2 2 0 0 1 2 2v18l-3-2-2 2-2-2-3 2V4a2 2 0 0 1 2-2zM9 7h6M9 11h6' },
  { label: 'Khata',     to: '/medical/khata',     icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
  { label: 'Sales',     to: '/medical/sales',     icon: 'M3 3v18h18M7 15l4-4 3 3 5-6' },
  { label: 'Expenses',  to: '/medical/expenses',  icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { label: 'Profit & Loss', to: '/medical/profit-loss', icon: 'M5 3v18h18M9 15l3-3 3 2 5-6' },
  { label: 'Day Close', to: '/medical/day-close', icon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
  { label: 'Staff',     to: '/medical/staff',     icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11' },
  { label: 'Leaves',    to: '/medical/leaves',    icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 16l2 2 4-4' },
  { label: 'Orders',    to: '/medical/orders',    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  {
  label: "My Offers",
  to: "/medical/my-offers",
  icon: "M12 2L2 7l10 5 10-5-10-5z"
},
  { label: 'Settings',  to: '/medical/settings',  icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
];

export default function MedicalDashboardLayout() {
  return <DashboardLayout navItems={NAV} consoleLabel="Medical Admin" />;
}
