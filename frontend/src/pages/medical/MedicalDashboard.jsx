import { motion } from 'framer-motion';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getProfile } from '../../services/profile.js';
import { fetchProducts } from '../../services/products.js';
import StatCard from '../../components/widgets/StatCard.jsx';
import QuickActions from '../../components/widgets/QuickActions.jsx';
import StaffAttendanceCard from '../../components/widgets/StaffAttendanceCard.jsx';

const QUICK_ACTIONS = [
  { label: 'Catalog',   hint: 'Browse all medicines', to: '/medical/catalog',  icon: 'M3 7h18M5 7v13h14V7M9 11h6' },
  { label: 'New order', hint: 'Record a sale',         to: '/medical/orders',   icon: 'M12 5v14M5 12h14' },
  { label: 'My offers', hint: 'Active promotions',     to: '/medical/my-offers',icon: 'M12 2 2 7l10 5 10-5-10-5z' },
  { label: 'Settings',  hint: 'Account preferences',   to: '/medical/settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
];

export default function MedicalDashboard() {
  const { data: profile } = useAsyncData(() => getProfile());
  const products = useAsyncData(() => fetchProducts());

  const list = products.data ?? [];
  const total = list.length;
  const lowStock = list.filter((p) => (p.quantity ?? 0) < 50);
  const outOfStock = list.filter((p) => (p.quantity ?? 0) === 0).length;

  const name = (profile?.firstName || '').trim() || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Medical Console
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-[34px]">
          Welcome back, {name}
        </h1>
        <p className="mt-2 text-ink-600">
          Today’s shop snapshot — inventory and low-stock alerts.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Catalog size" value={total} tone="brand"
          loading={products.loading} hint="Distinct SKUs in stock"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M3 7h18M5 7v13h14V7M9 11h6" /></svg>}
        />
        <StatCard
          label="Low stock"  value={lowStock.length} tone="amber"
          delta="Items < 50" deltaTone={lowStock.length > 0 ? 'bad' : 'good'} loading={products.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}
        />
        <StatCard
          label="Out of stock" value={outOfStock} tone="rose"
          delta={outOfStock > 0 ? 'Restock needed' : 'All in stock'} deltaTone={outOfStock > 0 ? 'bad' : 'good'} loading={products.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 12h8" /></svg>}
        />
      </section>

      <QuickActions actions={QUICK_ACTIONS} />

      <StaffAttendanceCard />

      {/* Real low-stock list (from /deopuri/products) */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
        <header className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-lg">⚠️</span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Low stock</h2>
            <p className="text-xs text-ink-500">
              {lowStock.length ? `${lowStock.length} medicine(s) below 50 units` : 'Everything is well stocked'}
            </p>
          </div>
        </header>

        {products.loading ? (
          <p className="py-6 text-center text-sm text-ink-400">Loading…</p>
        ) : lowStock.length > 0 ? (
          <ul className="divide-y divide-ink-100">
            {lowStock.slice(0, 10).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5">
                <span className="truncate text-sm font-medium text-ink-900">{p.name}</span>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    (p.quantity ?? 0) === 0
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {(p.quantity ?? 0) === 0 ? 'Out of stock' : `${p.quantity} left`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-ink-50/60 px-4 py-6 text-center text-sm text-ink-400">
            No low-stock medicines.
          </p>
        )}
      </section>
    </motion.div>
  );
}
