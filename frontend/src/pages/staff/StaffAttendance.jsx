import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMyAttendance, markAttendance } from '../../services/staffPortal.js';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '—');
const fmtTime = (t) => (t ? new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—');

export default function StaffAttendance() {
  const { data, loading, refresh } = useAsyncData((opts) => getMyAttendance(opts));
  const [marking, setMarking] = useState(false);

  const handleMark = async () => {
    if (marking) return;
    setMarking(true);
    try {
      await markAttendance();
      toast.success('Attendance marked for today');
      refresh();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 422) {
        toast(msg || 'You have already marked attendance today');
      } else {
        toast.error(msg || 'Could not mark attendance');
      }
    } finally {
      setMarking(false);
    }
  };

  const rows = useMemo(
    () => (data ?? []).map((r, i) => ({ id: r.id ?? `${r.date}-${i}`, ...r })),
    [data],
  );

  return (
    <section className="animate-fade-up space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">🧑‍⚕️ Staff portal</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            🗓️ My attendance
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700">{rows.length}</span>
          </h1>
          <p className="mt-1 text-sm text-ink-600">Mark today&apos;s attendance and review your history.</p>
        </div>
        <button
          type="button"
          onClick={handleMark}
          disabled={marking}
          className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.98] disabled:opacity-60"
        >
          {marking ? 'Marking…' : '🟢 Mark attendance'}
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-100" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">🗓️</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No attendance yet</p>
          <p className="text-xs text-ink-400">Mark your first attendance with the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {rows.map((r, i) => (
            <div
              key={r.id}
              style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
              className="animate-fade-up rounded-2xl border border-ink-200/70 bg-white p-4 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
            >
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-xl">✅</span>
              <p className="mt-2 text-sm font-bold text-ink-900">{fmtDate(r.date)}</p>
              <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                {r.status || 'Present'}
              </span>
              <p className="mt-2 text-[11px] text-ink-400">🕒 {fmtTime(r.markedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
