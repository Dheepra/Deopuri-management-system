import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import logo from "../assets/picture/logo.jpg";

import { useAuth } from '../auth/useAuth.js';
import { ROLE_LABELS } from '../auth/roles.js';
import SearchInput from '../components/ui/SearchInput.jsx';
import { http } from '../services/http.js';

// Map a nav label → the notification keywords that belong to that section, so an unread notification
// about e.g. "leave" lights up the Leaves menu item. Heuristic (title/message text match) — no
// backend change needed.
const NOTIF_KEYWORDS = [
  { k: 'leave', words: ['leave'] },
  { k: 'appointment', words: ['appointment', 'appoint', 'booking', 'booked', 'schedule'] },
  { k: 'order', words: ['order'] },
  { k: 'patient', words: ['patient'] },
  { k: 'doctor', words: ['doctor'] },
  { k: 'staff', words: ['staff'] },
  { k: 'offer', words: ['offer'] },
  { k: 'payment', words: ['payment', 'paid'] },
];

const keywordsForLabel = (label) => {
  const l = (label || '').toLowerCase();
  const hit = NOTIF_KEYWORDS.find((m) => l.includes(m.k));
  return hit ? hit.words : [];
};

const computeBadges = (navItems, notifications) => {
  const unread = notifications.filter((n) => !n.isRead);
  const badges = {};
  navItems.forEach((item) => {
    const words = keywordsForLabel(item.label);
    if (!words.length) return;
    const count = unread.filter((n) => {
      const text = `${n.title || ''} ${n.message || ''}`.toLowerCase();
      return words.some((w) => text.includes(w));
    }).length;
    if (count > 0) badges[item.to] = count;
  });
  return badges;
};

function Sidebar({ navItems, badges, open, onClose }) {
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
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto bg-[var(--color-night-800)] text-white transition-transform',
          'lg:static lg:z-10 lg:h-full lg:translate-x-0 lg:border-r lg:border-white/5 lg:shadow-[10px_0_30px_-16px_rgba(15,23,42,0.55)]',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="relative flex h-16 items-center justify-center border-b border-white/5 px-4">
          {/* soft brand glow behind the mark */}
          <div className="pointer-events-none absolute h-12 w-36 rounded-full bg-brand-500/25 blur-2xl" />
          <div className="relative rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.04]">
            <img src={logo} alt="Deopuri Herbal" className="h-9 w-auto" />
          </div>
        </div>

        <nav className="space-y-0.5 px-3 py-3">
          {navItems.map((item) => {
            const count = badges?.[item.to] || 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {/* active accent bar */}
                    <span
                      className={[
                        'absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-brand-400 transition-all duration-200',
                        isActive ? 'h-6 w-1 opacity-100' : 'h-0 w-0 opacity-0',
                      ].join(' ')}
                    />
                    <span
                      className={[
                        'grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all duration-200',
                        isActive ? 'bg-brand-500/20 text-brand-300' : 'text-white/50 group-hover:scale-110 group-hover:text-white',
                      ].join(' ')}
                    >
                      {item.icon ? (
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d={item.icon} />
                        </svg>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>

                    <span className="flex-1 truncate transition-transform duration-200 group-hover:translate-x-0.5">
                      {item.label}
                    </span>

                    {count > 0 && (
                      <span className="relative flex shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                        <span className="relative inline-flex min-w-[18px] justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-[18px] text-white">
                          {count > 9 ? '9+' : count}
                        </span>
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function Topbar({ onMenu, navItems = [] }) {
  const { user, role, signOut } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // Quick-nav search over the sidebar sections (type "doctors", "orders"… → jump there).
  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const searchResults = q.trim()
    ? navItems.filter((it) => it.label.toLowerCase().includes(q.trim().toLowerCase()))
    : [];

  const goToResult = (item) => {
    setQ('');
    setSearchOpen(false);
    navigate(item.to);
  };

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onDown = (e) => {
      if (searchRef.current?.contains(e.target)) return;
      setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [searchOpen]);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const notificationRef = useRef(null);

  const [photoUrl, setPhotoUrl] = useState('');

  const [displayName, setDisplayName] = useState('');

  const userId = user?.id;

  const initial = (displayName?.[0] || user?.email?.[0] || 'A').toUpperCase();

  // Fetch the current user's photo + name once so the topbar avatar shows their picture and name.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await http.get('/deopuri/users/me');
        if (!active) return;
        if (data?.photoUrl) setPhotoUrl(data.photoUrl);
        setDisplayName([data?.firstName, data?.lastName].filter(Boolean).join(' ').trim());
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
      const { data } = await http.get(`/deopuri/notifications/${userId}`);

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
      await http.put(`/deopuri/notifications/read/${userId}`);

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

      {/* SEARCH — quick jump to any section */}
      <div
        className="relative hidden flex-1 lg:block"
        ref={searchRef}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setSearchOpen(false);
          if (e.key === 'Enter' && searchResults[0]) goToResult(searchResults[0]);
        }}
      >
        <SearchInput
          value={q}
          onChange={(v) => { setQ(v); setSearchOpen(true); }}
          placeholder="Search sections… e.g. Doctors, Orders"
        />

        {searchOpen && q.trim() && (
          <div className="absolute inset-x-0 top-12 z-30 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-card)]">
            {searchResults.length === 0 ? (
              <p className="p-4 text-sm text-ink-500">No matches for “{q}”.</p>
            ) : (
              searchResults.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToResult(item)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-brand-50"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-500">
                    {item.icon ? (
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-ink-900">{item.label}</span>
                  <span className="ml-auto text-xs text-ink-400">↵</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">

        {/* NOTIFICATION */}
{[
  "COMPANY_ADMIN",
  "HOSPITAL_ADMIN",
  "MEDICAL_ADMIN",
  "DOCTOR",
  "STAFF"
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
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {initial}
              </span>
            )}

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-ink-900">
                {displayName || user?.email}
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
function BottomNav({ navItems, badges, onMore }) {
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
                <span className="relative">
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
                  {(badges?.[item.to] || 0) > 0 && (
                    <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </span>
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

  // Notifications drive the per-menu badges. Fetched here (not just in the topbar bell) so the
  // sidebar can show which section a new notification belongs to.
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      if (!userId) return;
      const { data } = await http.get(`/deopuri/notifications/${userId}`);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 60000);
    const onFocus = () => loadNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadNotifications]);

  const badges = useMemo(() => computeBadges(navItems, notifications), [navItems, notifications]);

  return (
    // Framed app-shell: the whole window (sidebar + content) sits inside one rounded, bordered frame
    // with a small gap to the browser edge. Only the content area scrolls, so the frame never "cuts".
    <div className="bg-ink-100 lg:h-dvh lg:overflow-hidden lg:p-1.5">
      <div className="relative flex min-h-dvh flex-col bg-ink-50 lg:h-full lg:flex-row lg:overflow-hidden lg:rounded-2xl lg:border lg:border-ink-200 lg:shadow-sm">

        <Sidebar
          navItems={navItems}
          badges={badges}
          open={open}
          onClose={() => setOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">

          <Topbar
            onMenu={() => setOpen(true)}
            navItems={navItems}
          />

          {/* Only this area scrolls; extra bottom padding on mobile clears the bottom tab bar. */}
          <main className="flex-1 p-4 pb-28 sm:p-6 lg:overflow-y-auto lg:pb-8">
            <Outlet />
          </main>

        </div>
      </div>

      <BottomNav navItems={navItems} badges={badges} onMore={() => setOpen(true)} />
    </div>
  );
}