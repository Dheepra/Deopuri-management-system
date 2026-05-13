import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/useAuth.js';
import { ROLE_LABELS } from '../auth/roles.js';
import SearchInput from '../components/ui/SearchInput.jsx';

/**
 * Shared dashboard chrome. Each console (admin, hospital, medical) wraps this
 * with its own nav config so we keep a single source of truth for layout.
 */
function Sidebar({ navItems, consoleLabel, open, onClose }) {
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
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/5 bg-[var(--color-night-800)] text-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold tracking-tight">Deopuri</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">
              {consoleLabel}
            </p>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d={item.icon} />
              </svg>
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
  const initial = (user?.email?.[0] ?? 'A').toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden flex-1 lg:block">
        <SearchInput
          value={search ?? ''}
          onChange={onSearchChange ?? (() => {})}
          placeholder="Search patients, doctors, medicines…"
          className="max-w-md"
        />
      </div>

      <div className="relative ml-auto flex items-center gap-2">
        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-lg text-ink-700 transition-colors hover:bg-ink-100"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-ink-100"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {initial}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-ink-900">{user?.email ?? 'Admin'}</span>
            <span className="block text-[11px] text-ink-500">{ROLE_LABELS[role] ?? '—'}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden h-4 w-4 text-ink-400 sm:block">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-[var(--shadow-card-hover)]"
            >
              <div className="border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-semibold text-ink-900">{user?.email}</p>
                <p className="text-xs text-ink-500">{ROLE_LABELS[role]}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="block w-full px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  navItems,
  consoleLabel = 'Admin Console',
  search,
  onSearchChange,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar
        navItems={navItems}
        consoleLabel={consoleLabel}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="lg:pl-64">
        <Topbar
          onMenu={() => setOpen(true)}
          search={search}
          onSearchChange={onSearchChange}
        />
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
