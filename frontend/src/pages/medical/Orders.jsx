import EmptyState from '../../components/ui/EmptyState.jsx';

export default function Orders() {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Orders</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          Sales &amp; orders
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Record a sale, track open orders, and review history.
        </p>
      </header>

      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="No orders yet"
        description="Start recording sales to populate this view. Order capture ships in the next release."
      />
    </section>
  );
}
