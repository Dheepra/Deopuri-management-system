import { motion } from 'framer-motion';
import { useAuth } from '../../auth/useAuth.js';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getPendingUsers, approveUser, rejectUser } from '../../services/auth.js';

const KPIS = [
  { label: 'Active orders', value: '24', delta: '+12%', tone: 'good' },
  { label: 'Pending users', value: '3', delta: '+1', tone: 'flat' },
  { label: 'Stock alerts', value: '7', delta: '−2', tone: 'bad' },
  { label: 'Monthly revenue', value: '₹1.2L', delta: '+8%', tone: 'good' },
];

const TONE = {
  good: 'text-brand-700 bg-brand-50',
  bad: 'text-red-600 bg-red-50',
  flat: 'text-ink-600 bg-ink-100',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);

  const name = user?.email?.split('@')[0] ?? 'admin';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getPendingUsers();
      setPendingUsers(data);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      toast.success('User approved & mail sent');

      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectUser(id);
      toast.success('User rejected');

      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      toast.error('Reject failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Today
        </p>

        <h1 className="mt-1 font-display text-3xl font-bold text-ink-900">
          Welcome back, {name}
        </h1>

        <p className="mt-2 text-ink-600">
          Here is what is happening across your company today.
        </p>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{kpi.label}</p>

            <div className="mt-3 flex items-center justify-between">
              <p className="font-display text-3xl font-bold text-ink-900">{kpi.value}</p>

              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${TONE[kpi.tone]}`}
              >
                {kpi.delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* USERS */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Pending User Approvals
          </h2>

          <div className="mt-5 space-y-3">
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-ink-500">No pending users</p>
            ) : (
              pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                >
                  {/* USER INFO */}
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {u.firstName} {u.lastName}
                    </p>

                    <p className="mt-1 text-xs text-ink-500">
                      {u.email}
                    </p>

                    <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-400">
                      {u.role}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-colors hover:bg-brand-700"
                    >
                      Approve
                    </button>

                    {/*
                     * Destructive reject button keeps Tailwind red-600 — the
                     * design system in globals.css has no danger token. If a
                     * --color-danger-* scale is added later, swap this and the
                     * TONE.bad pill above to use it.
                     */}
                    <button
                      onClick={() => handleReject(u.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="rounded-2xl border border-ink-100 bg-gradient-to-br from-[var(--color-night-800)] to-[var(--color-night-700)] p-6 text-white shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Roadmap
          </p>

          <h3 className="mt-2 font-display text-lg font-semibold">
            Hospital & Medical admin tiers
          </h3>

          <p className="mt-2 text-sm text-white/70">
            Coming next: per-vertical inventory rules, role-scoped notifications, and exportable
            approval logs.
          </p>
        </aside>
      </section>
    </motion.div>
  );
}