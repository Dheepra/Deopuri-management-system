import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getLeaves, updateLeaveStatus } from '../../services/hospitalLeaves.js';

const FILTERS = [
  { key: 'All', label: 'All', emoji: '📋' },
  { key: 'PENDING', label: 'Pending', emoji: '⏳' },
  { key: 'APPROVED', label: 'Approved', emoji: '✅' },
  { key: 'REJECTED', label: 'Rejected', emoji: '❌' },
];

const AVATAR_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-sky-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
];

const statusMeta = (s) => {
  switch (s) {
    case 'APPROVED':
      return { label: 'Approved', emoji: '✅', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
    case 'REJECTED':
      return { label: 'Rejected', emoji: '❌', pill: 'bg-red-50 text-red-700 ring-red-200' };
    case 'PENDING':
      return { label: 'Pending', emoji: '⏳', pill: 'bg-amber-50 text-amber-700 ring-amber-200' };
    default:
      return { label: s || '—', emoji: '•', pill: 'bg-ink-100 text-ink-600 ring-ink-200' };
  }
};

function StatusPill({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export default function Leaves() {
  const { data, loading, refresh } = useAsyncData((opts) => getLeaves(opts));
  const [filter, setFilter] = useState('All');
  const [busyId, setBusyId] = useState(null);

  const act = async (row, status) => {
    setBusyId(row.id);
    try {
      await updateLeaveStatus(row.id, status);
      toast.success(`Leave ${status.toLowerCase()}`);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update leave');
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const base = data ?? [];
    return {
      All: base.length,
      PENDING: base.filter((l) => l.status === 'PENDING').length,
      APPROVED: base.filter((l) => l.status === 'APPROVED').length,
      REJECTED: base.filter((l) => l.status === 'REJECTED').length,
    };
  }, [data]);

  const rows = useMemo(() => {
    const base = data ?? [];
    return filter === 'All' ? base : base.filter((l) => l.status === filter);
  }, [data, filter]);

  return (
    <section className="animate-fade-up space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">🏖️ Staff leaves</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            📝 Leave requests
          </h1>
          <p className="mt-1 text-sm text-ink-600">Approve or reject leave applications from your staff.</p>
        </div>
        {counts.PENDING > 0 && (
          <span className="animate-pop rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            ⏳ {counts.PENDING} pending
          </span>
        )}
      </header>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
              filter === f.key
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50',
            ].join(' ')}
          >
            {f.emoji} {f.label}
            <span className={`rounded-full px-1.5 text-[10px] ${filter === f.key ? 'bg-white/25' : 'bg-ink-100 text-ink-500'}`}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Leave cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">🏖️</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No leave requests</p>
          <p className="text-xs text-ink-400">Nothing to review in this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((l, i) => {
            const name = (l?.staffName || 'Unknown').trim();
            const initial = name.charAt(0).toUpperCase() || 'S';
            const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            return (
              <div
                key={l?.id ?? i}
                style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}
                className="group animate-fade-up flex flex-col rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-base font-bold text-white transition-transform group-hover:scale-110`}>
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-900">{name}</p>
                    <p className="truncate text-xs text-ink-500">🏷️ {l?.type || 'Leave'}</p>
                  </div>
                  <StatusPill status={l?.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-ink-50 px-2.5 py-1.5 font-medium text-ink-700">
                    📅 {fmtDate(l?.fromDate)} <span className="text-ink-300">→</span> {fmtDate(l?.toDate)}
                  </span>
                  {l?.days != null && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 font-semibold text-brand-700">
                      ⏱️ {l.days} day{Number(l.days) === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {l?.reason && (
                  <p className="mt-2 line-clamp-2 text-xs text-ink-500">💬 {l.reason}</p>
                )}

                {l?.status === 'PENDING' && (
                  <div className="mt-3 flex gap-2 border-t border-ink-50 pt-3">
                    <button
                      type="button"
                      disabled={busyId === l.id}
                      onClick={() => act(l, 'APPROVED')}
                      className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97] disabled:opacity-60"
                    >
                      ✅ Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === l.id}
                      onClick={() => act(l, 'REJECTED')}
                      className="flex-1 rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-[.97] disabled:opacity-60"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
