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
          <article key={kpi.label} className="rounded-2xl border bg-white p-5">
            <p className="text-xs uppercase text-ink-500">{kpi.label}</p>

            <div className="mt-3 flex justify-between">
              <p className="text-3xl font-bold">{kpi.value}</p>

              <span className={`rounded-full px-2 py-1 text-xs ${TONE[kpi.tone]}`}>
                {kpi.delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* USERS */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Pending User Approvals
          </h2>

          <div className="mt-5 space-y-3">
            {pendingUsers.length === 0 ? (
              <p>No pending users</p>
            ) : (
              pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between rounded-xl border p-4"
                >
                  {/* USER INFO */}
                  <div>
                    <p className="font-semibold">
                      {u.firstName} {u.lastName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {u.email}
                    </p>

                    <p className="text-xs">{u.role}</p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(u.id)}
                      className="rounded bg-red-600 px-4 py-2 text-white"
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
        <aside className="rounded-2xl bg-gradient-to-br from-[var(--color-night-800)] to-[var(--color-night-700)] p-6 text-white">
          <h3 className="text-lg font-semibold">Roadmap</h3>

          <p className="mt-2 text-sm text-white/70">
            Hospital & Medical admin tiers
          </p>
        </aside>
      </section>
    </motion.div>
  );
}