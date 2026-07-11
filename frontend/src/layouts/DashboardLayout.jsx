import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import logo from "../assets/picture/logo.jpg";

import { useAuth } from '../auth/useAuth.js';
import { ROLE_LABELS } from '../auth/roles.js';
import SearchInput from '../components/ui/SearchInput.jsx';
import { http } from '../services/http.js';

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
  const { user, role, signOut } = useAuth();

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
      if (!userId) return;

      // Relative path → Vite proxy → backend; the http interceptor attaches the JWT. Works on mobile.
      const { data } = await http.get(`/api/notifications/${userId}`);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Auto-refresh: poll every 60s AND when the tab regains focus, so a new message shows up on its
  // own without a manual reload (and approved/rejected requests disappear within a minute).
  useEffect(() => {
    const intervalId = setInterval(loadNotifications, 60000);
    const onFocus = () => loadNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
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
    if (!userId || unreadCount === 0) return;

    try {
      await http.put(`/api/notifications/read/${userId}`);

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
    <header className="pt-safe sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-ink-100 bg-white/80 px-4 backdrop-blur sm:px-6">

      {/* MOBILE MENU */}
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 lg:hidden"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {/* MOBILE BRAND (sidebar is hidden on phones) */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.4 7.7 8 10 4.6-2.3 8-5 8-10V6l-8-4Z" /><path d="m9 12 2 2 4-4" /></svg>
        </span>
        <span className="font-display text-base font-bold tracking-tight text-ink-900">Deopuri</span>
      </div>

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
        {/* NOTIFICATION */}
{[
  "COMPANY_ADMIN",
  "HOSPITAL_ADMIN",
  "MEDICAL_ADMIN"
].includes(role) && (
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
)}
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

// Mobile app-style bottom tab bar. Shows the primary destinations with icons; if there are more
// than 5, the last slot becomes "More" and opens the full drawer. Hidden on desktop (lg+), where the
// sidebar is the navigation — so it reads like a website on PC and like an app on the phone.
function BottomNav({ navItems, onMore }) {
  const compact = navItems.length > 5;
  const items = compact ? navItems.slice(0, 4) : navItems.slice(0, 5);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/90 pb-safe backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
                isActive ? 'text-brand-700' : 'text-ink-400 hover:text-ink-600',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.2 : 1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                <span className="max-w-[64px] truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {compact && (
          <button
            type="button"
            onClick={onMore}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-ink-400 hover:text-ink-600"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" />
            </svg>
            <span>More</span>
          </button>
        )}
      </div>
    </nav>
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

        {/* extra bottom padding on mobile so content clears the bottom tab bar */}
        <main className="p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
          <Outlet />
        </main>

      </div>

      <BottomNav navItems={navItems} onMore={() => setOpen(true)} />
    </div>
  );
}