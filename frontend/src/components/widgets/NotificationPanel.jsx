import Badge from '../ui/Badge.jsx';

const TONE = { warning: 'warning', info: 'info', danger: 'danger', success: 'success' };

export default function NotificationPanel({ items, onMarkAllRead }) {
  // The button used to be a dead placeholder. We accept an optional callback
  // so embedders can wire it to their real mark-all-read flow (the layout's
  // bell-click handler, in the case of a future shared component). Callers
  // that don't pass one — currently HospitalDashboard, which is on mock data
  // — get a disabled-looking, no-op button so the UI doesn't lie about what
  // clicking will do.
  const handleClick = () => {
    if (typeof onMarkAllRead === 'function') {
      onMarkAllRead();
    }
  };

  return (
    <section className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">Notifications</h3>
          <p className="text-xs text-ink-500">{items.length} unread</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={!onMarkAllRead}
          className="text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:text-ink-300"
        >
          Mark all read
        </button>
      </header>

      <ul className="mt-5 space-y-3">
        {items.map((n) => (
          <li
            key={n.id}
            className="rounded-xl border border-ink-100 p-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink-900">{n.title}</p>
              <Badge tone={TONE[n.tone] ?? 'neutral'}>{n.label}</Badge>
            </div>
            <p className="mt-1 text-xs text-ink-500">{n.detail}</p>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-400">{n.time}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
