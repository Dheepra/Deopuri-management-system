import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuth } from '../auth/useAuth.js';
import { ROLE_LABELS } from '../auth/roles.js';
import SearchInput from '../components/ui/SearchInput.jsx';

function Sidebar({ navItems, open, onClose }) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-64 border-r bg-[var(--color-night-800)] text-white transition-transform',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-16 items-center px-6">
          <h2 className="font-semibold text-lg">Deopuri</h2>
        </div>

        <nav className="space-y-1 px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'flex rounded-lg px-3 py-2 bg-white/10'
                  : 'flex rounded-lg px-3 py-2 text-white/60 hover:bg-white/5'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

function Topbar({ onMenu, search, onSearchChange }) {
  const { user, role, signOut } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  // SAFE USER ID
 const session = JSON.parse(localStorage.getItem('auth.session'));

const userId = user?.id || session?.id;

  const token =
    JSON.parse(localStorage.getItem('auth.session'))?.token;

  const initial = (user?.email?.[0] || 'A').toUpperCase();

  // FETCH NOTIFICATIONS
  useEffect(() => {
  const loadNotifications = async () => {
    try {
      if (!userId || !token) return;

      const response = await fetch(
        `http://localhost:8080/api/notifications/${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("NOTIFICATIONS API RESPONSE:", data);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  loadNotifications();
}, [userId, token]);

  // UNREAD COUNT
  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  // MARK ALL AS READ
  const handleNotificationClick = async () => {
    const newState = !notificationOpen;

    setNotificationOpen(newState);

    if (!newState || !userId || !token) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/read/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch (err) {
      console.log('Read Notification Error:', err);
    }
  };

  // LOGOUT
  const handleSignOut = () => {
    signOut();

    toast.success('Signed out');

    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white px-6">

      {/* MOBILE MENU */}
      <button
        onClick={onMenu}
        className="h-10 w-10 rounded lg:hidden"
      >
        ☰
      </button>

      {/* SEARCH */}
      <div className="hidden flex-1 lg:block">
        <SearchInput
          value={search ?? ''}
          onChange={onSearchChange ?? (() => {})}
          placeholder="Search..."
        />
      </div>

      <div className="ml-auto flex items-center gap-3">

        {/* NOTIFICATION */}
        <div className="relative">

          <button
            onClick={handleNotificationClick}
            className="relative h-10 w-10 rounded hover:bg-gray-100"
          >
            🔔

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-12 w-80 rounded-lg border bg-white shadow-lg">

              <div className="border-b p-3 font-semibold">
                Notifications
              </div>

              <div className="max-h-72 overflow-auto">

                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="border-b p-3"
                    >
                      <p className="font-medium">
                        {n.title}
                      </p>

                      <p className="text-sm text-gray-500">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative">

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white">
              {initial}
            </span>

            <div className="text-left">
              <p className="text-sm font-medium">
                {user?.email}
              </p>

              <small className="text-gray-500">
                {ROLE_LABELS[role]}
              </small>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 rounded border bg-white shadow">

              <button
                onClick={handleSignOut}
                className="w-full p-3 text-left hover:bg-gray-100"
              >
                Sign out
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default function DashboardLayout({
  navItems,
  search,
  onSearchChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar
        navItems={navItems}
        open={open}
        onClose={() => setOpen(false)}
      />

      <div className="lg:pl-64">

        <Topbar
          onMenu={() => setOpen(true)}
          search={search}
          onSearchChange={onSearchChange}
        />

        <main className="p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}