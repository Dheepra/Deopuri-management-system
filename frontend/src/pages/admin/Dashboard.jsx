import { motion } from 'framer-motion';
import { useAuth } from '../../auth/useAuth.js';

const KPIS = [
  { label: 'Active orders',  value: '24',  delta: '+12%', tone: 'good' },
  { label: 'Pending users',  value: '3',   delta: '+1',   tone: 'flat' },
  { label: 'Stock alerts',   value: '7',   delta: '−2',   tone: 'bad' },
  { label: 'Monthly revenue',value: '₹1.2L', delta: '+8%', tone: 'good' },
];

const QUICK_ACTIONS = [
  { title: 'Approve pending users', hint: '3 awaiting review', to: '/admin/team' },
  { title: 'Restock low items',     hint: '7 SKUs below threshold', to: '/admin/inventory' },
  { title: 'Review today’s orders', hint: '24 orders since midnight', to: '/admin/orders' },
];

const TONE = {
  good: 'text-brand-700 bg-brand-50',
  bad:  'text-red-600 bg-red-50',
  flat: 'text-ink-600 bg-ink-100',
};

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] ?? 'admin';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Today
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Welcome back, {name}
        </h1>
        <p className="mt-2 text-ink-600">
          Here is what is happening across your company today.
        </p>
      </header>

      <section
        aria-label="KPIs"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {KPIS.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
              {kpi.label}
            </p>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-display text-3xl font-bold text-ink-900">{kpi.value}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TONE[kpi.tone]}`}>
                {kpi.delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold text-ink-900">Quick actions</h2>
          <p className="mt-1 text-sm text-ink-600">
            Three things worth your attention this morning.
          </p>
          <ul className="mt-5 space-y-2.5">
            {QUICK_ACTIONS.map((action) => (
              <li
                key={action.title}
                className="group flex items-center justify-between rounded-xl border border-ink-100 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <div>
                  <p className="font-semibold text-ink-900">{action.title}</p>
                  <p className="text-sm text-ink-500">{action.hint}</p>
                </div>
                <span className="text-brand-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  →
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded-2xl border border-ink-100 bg-gradient-to-br from-[var(--color-night-800)] to-[var(--color-night-700)] p-6 text-white shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Roadmap
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold">
            Hospital &amp; Medical admin tiers
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Multi-role workspaces are next. You will be able to invite Hospital and Medical
            admins under your company.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Shipping soon
          </span>
        </aside>
      </section>
    </motion.div>
  );
}
