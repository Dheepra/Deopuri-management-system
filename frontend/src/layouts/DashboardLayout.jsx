import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import logo from "../assets/picture/logo.jpg";

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
        <div className="flex h-16 items-center justify-center px-4 mt-2">
  <img
    src={logo}
    alt="Deopuri"
    className="h-12 w-auto"
  />
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
  const { user, token, role, signOut } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const notificationRef = useRef(null);

  const userId = user?.id;

  const initial = (user?.email?.[0] || 'A').toUpperCase();

  // FETCH NOTIFICATIONS
  //
  // Hoisted out of the useEffect with useCallback so handleNotificationClick
  // can re-trigger a fresh fetch after the PUT succeeds. Keeping it inside the
  // effect was fine for the initial load but meant the click handler had to
  // do its own optimistic state surgery — which is what drifted from the
  // backend (the 18-stale-items bug).
  const loadNotifications = useCallback(async () => {
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

      if (!response.ok) {
        throw new Error(`Notifications fetch failed (${response.status})`);
      }

      const data = await response.json();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  }, [userId, token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close the panel when clicking outside (bell stays the toggle).
  useEffect(() => {
    if (!notificationOpen) return undefined;

    const onPointerDown = (event) => {
      if (notificationRef.current?.contains(event.target)) return;
      setNotificationOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [notificationOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleBellClick = () => {
    setNotificationOpen((open) => {
      const next = !open;
      if (next) loadNotifications();
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    if (!userId || !token || unreadCount === 0) return;

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

      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      console.log('Read Notification Error:', err);
      toast.error('Could not mark notifications as read');
    }
  };

  // LOGOUT
  const handleSignOut = () => {
    signOut();

    toast.success('Signed out');

    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/80 px-6 backdrop-blur">

      {/* MOBILE MENU */}
      <button
        onClick={onMenu}
        className="h-10 w-10 rounded-lg text-ink-600 transition-colors hover:bg-ink-100 lg:hidden"
        aria-label="Open menu"
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
        <div className="relative" ref={notificationRef}>

          <button
            type="button"
            onClick={handleBellClick}
            className="relative h-10 w-10 rounded-lg text-ink-600 transition-colors hover:bg-ink-100"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            🔔

            {/*
             * Notification count badge — uses Tailwind red-500 by convention
             * (the design tokens in globals.css have no danger scale yet).
             */}
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-card)]">

              <div className="flex items-center justify-between gap-2 border-b border-ink-100 p-3">
                <span className="font-display text-sm font-semibold text-ink-900">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="shrink-0 text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-auto">

                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-ink-500">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={[
                        'border-b border-ink-100 p-3 transition-colors last:border-b-0 hover:bg-brand-50/40',
                        !n.isRead ? 'bg-brand-50/30' : '',
                      ].join(' ')}
                    >
                      
                      <p className="text-sm font-medium text-ink-900">
                        {n.title}
                      </p>

                      <p className="mt-1 text-xs text-ink-500">
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
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-ink-100"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initial}
            </span>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-ink-900">
                {user?.email}
              </p>

              <small className="text-xs text-ink-500">
                {ROLE_LABELS[role]}
              </small>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-card)]">

              <button
                onClick={handleSignOut}
                className="w-full rounded-2xl p-3 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
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
    <div className="min-h-screen bg-ink-50">

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

        <main className="p-6 sm:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}