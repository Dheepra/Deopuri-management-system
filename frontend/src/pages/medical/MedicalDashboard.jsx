import { motion } from 'framer-motion';
import { useAuth } from '../../auth/useAuth.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { fetchProducts } from '../../services/products.js';
import StatCard from '../../components/widgets/StatCard.jsx';
import QuickActions from '../../components/widgets/QuickActions.jsx';
import ActivityFeed from '../../components/widgets/ActivityFeed.jsx';

const QUICK_ACTIONS = [
  { label: 'Catalog',   hint: 'Browse all medicines',   to: '/medical/catalog', icon: 'M3 7h18M5 7v13h14V7M9 11h6' },
  { label: 'New order', hint: 'Record a sale',          to: '/medical/orders',  icon: 'M12 5v14M5 12h14' },
  { label: 'Restock',   hint: 'Add to inventory',       to: '/medical/catalog', icon: 'M3 12h18M12 3v18' },
  { label: 'Settings',  hint: 'Account preferences',    to: '/medical/settings',icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
];

const ACTIVITY = [
  { id: 1, kind: 'appointment', title: 'Sold 12 strips of Paracetamol', subtitle: 'Order #4821 · ₹468',           time: '2m ago',
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { id: 2, kind: 'alert',       title: 'Cough Syrup low on stock',     subtitle: '8 bottles left · reorder',     time: '38m ago',
    icon: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
  { id: 3, kind: 'discharge',   title: 'Stock replenished',            subtitle: 'Vitamin D3 60K IU · +120 units',time: '1h ago',
    icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' },
];

export default function MedicalDashboard() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] ?? 'admin';
  const products = useAsyncData(() => fetchProducts());

  const total = products.data?.length ?? 0;
  const lowStock = (products.data ?? []).filter((p) => (p.quantity ?? 0) < 50).length;
  const outOfStock = (products.data ?? []).filter((p) => (p.quantity ?? 0) === 0).length;

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
          Today’s shop snapshot — inventory, low-stock alerts, and recent activity.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Catalog size" value={total} tone="brand"
          loading={products.loading} hint="Distinct SKUs in stock"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M3 7h18M5 7v13h14V7M9 11h6" /></svg>}
        />
        <StatCard
          label="Low stock"  value={lowStock} tone="amber"
          delta="Items < 50" deltaTone={lowStock > 0 ? 'bad' : 'good'} loading={products.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>}
        />
        <StatCard
          label="Out of stock" value={outOfStock} tone="rose"
          delta="Need restock" deltaTone={outOfStock > 0 ? 'bad' : 'good'} loading={products.loading}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 12h8" /></svg>}
        />
      </section>

      <QuickActions actions={QUICK_ACTIONS} />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed items={ACTIVITY} loading={false} />
        </div>
        <aside className="rounded-2xl border border-ink-100 bg-gradient-to-br from-[var(--color-night-800)] to-[var(--color-night-700)] p-6 text-white shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Tip</p>
          <h3 className="mt-2 font-display text-lg font-semibold">Connect your supplier feed</h3>
          <p className="mt-2 text-sm text-white/70">
            Once linked, stock auto-decrements on sale and reorder hints surface in your inbox.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Coming soon
          </span>
        </aside>
      </section>
    </motion.div>
  );
}
