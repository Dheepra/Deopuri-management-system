import DashboardLayout from './DashboardLayout.jsx';

const NAV = [
  { label: 'Overview',  to: '/admin/dashboard', icon: 'M3 12 12 3l9 9M5 10v10h14V10', end: true },
    { label: 'Products',  to: '/admin/products', icon: 'M20 7H4V5h16v2zm0 4H4v2h16v-2zm0 4H4v2h16v-2z' },
  { label: 'Inventory', to: '/admin/inventory', icon: 'M3 7h18M5 7v13h14V7M9 11h6' },
  { label: 'Orders',    to: '/admin/orders',    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  {
  label: "Payments",
  to: "/admin/payments",
  icon: "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6v2m0 16v2M2 12h2m16 0h2"
},
{
  label: "Offers",
  to: "/admin/offers",
  icon: "M12 2L2 7l10 5 10-5-10-5zm0 7L2 14l10 5 10-5-10-5zm0 7l-10-5v5l10 5 10-5v-5l-10 5z"
},

{
  label: "Top Customers",
  to: "/admin/top-customers",
  icon: "M12 17l-5 3 1-6-4-4 6-.9L12 3l2 6.1 6 .9-4 4 1 6z"
},

  { label: 'Team',      to: '/admin/team',      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { label: 'Settings',  to: '/admin/settings',  icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
];

export default function CompanyDashboardLayout() {
  return <DashboardLayout navItems={NAV} consoleLabel="Company Admin" />;
}
