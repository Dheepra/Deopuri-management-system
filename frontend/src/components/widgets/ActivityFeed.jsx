import { motion } from 'framer-motion';
import Skeleton from '../ui/Skeleton.jsx';

const TONE = {
  admission: 'bg-sky-50 text-sky-700',
  discharge: 'bg-emerald-50 text-emerald-700',
  alert: 'bg-amber-50 text-amber-700',
  appointment: 'bg-brand-50 text-brand-700',
  default: 'bg-ink-100 text-ink-700',
};

export default function ActivityFeed({ items, loading }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <header className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink-900">Recent activity</h3>
        <button
          type="button"
          className="text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          View all
        </button>
      </header>

      <ul className="mt-5 space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8" rounded="rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))
          : items.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="flex items-start gap-3"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TONE[item.kind] ?? TONE.default}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d={item.icon ?? 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z'} />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-ink-500">{item.subtitle}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] uppercase tracking-wider text-ink-400">
                  {item.time}
                </span>
              </motion.li>
            ))}
      </ul>
    </section>
  );
}
