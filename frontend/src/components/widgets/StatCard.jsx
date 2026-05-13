import { motion } from 'framer-motion';
import Skeleton from '../ui/Skeleton.jsx';

const TONES = {
  brand:  'from-brand-500 to-brand-700',
  ocean:  'from-sky-500 to-indigo-600',
  amber:  'from-amber-500 to-orange-600',
  rose:   'from-rose-500 to-fuchsia-600',
  slate:  'from-slate-600 to-slate-800',
};

const DELTA_TONES = {
  good: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
  bad:  'text-red-700 bg-red-50 ring-red-200',
  flat: 'text-ink-600 bg-ink-100 ring-ink-200',
};

export default function StatCard({
  label,
  value,
  delta,
  deltaTone = 'flat',
  icon,
  tone = 'brand',
  loading = false,
  hint,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[var(--shadow-card)] backdrop-blur-md transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    >
      <div
        aria-hidden="true"
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${TONES[tone]} opacity-10 blur-2xl`}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</p>
          <div className="mt-2 flex items-end gap-2">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="font-display text-3xl font-bold text-ink-900">{value}</p>
            )}
            {delta && !loading && (
              <span
                className={`mb-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${DELTA_TONES[deltaTone]}`}
              >
                {delta}
              </span>
            )}
          </div>
          {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
        </div>
        {icon && (
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${TONES[tone]} text-white shadow-sm`}
          >
            {icon}
          </span>
        )}
      </div>
    </motion.article>
  );
}
