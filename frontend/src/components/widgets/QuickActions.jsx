import { Link } from 'react-router-dom';

export default function QuickActions({ actions }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <h3 className="font-display text-lg font-semibold text-ink-900">Quick actions</h3>
      <p className="mt-1 text-xs text-ink-500">Common tasks across the hospital</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="group flex flex-col items-start gap-2 rounded-xl border border-ink-100 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-card-hover)]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d={action.icon} />
              </svg>
            </span>
            <span className="text-sm font-semibold text-ink-900">{action.label}</span>
            <span className="text-xs text-ink-500">{action.hint}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
