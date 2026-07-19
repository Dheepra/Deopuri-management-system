import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMyAppointments, setAppointmentStatus } from '../../services/doctorAppointments.js';

const TIME_TABS = [
  { key: 'Today', emoji: '📍' },
  { key: 'Upcoming', emoji: '⏭️' },
  { key: 'Past', emoji: '⏮️' },
  { key: 'All', emoji: '📋' },
];

const statusMeta = (s) => {
  switch (s) {
    case 'BOOKED': return { label: 'Booked', emoji: '🆕', pill: 'bg-amber-50 text-amber-700 ring-amber-200' };
    case 'CONFIRMED': return { label: 'Confirmed', emoji: '✅', pill: 'bg-sky-50 text-sky-700 ring-sky-200' };
    case 'COMPLETED': return { label: 'Completed', emoji: '🎉', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
    case 'CANCELLED': return { label: 'Cancelled', emoji: '❌', pill: 'bg-red-50 text-red-700 ring-red-200' };
    default: return { label: s || '—', emoji: '•', pill: 'bg-ink-100 text-ink-600 ring-ink-200' };
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

// Local YYYY-MM-DD (matches the backend LocalDate string, in the user's timezone).
function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

export default function DoctorAppointments() {
  const { data, loading, refresh } = useAsyncData(() => getMyAppointments());
  const [filter, setFilter] = useState('Today');
  const [busyId, setBusyId] = useState(null);

  const rows = useMemo(() => data ?? [], [data]);
  const today = todayStr();

  const todaysToSee = useMemo(
    () => rows.filter((a) => a.status === 'CONFIRMED' && a.appointmentDate === today),
    [rows, today],
  );

  const markSeen = async (appt) => {
    setBusyId(appt.id);
    try {
      await setAppointmentStatus(appt.id, 'COMPLETED');
      toast.success(`Marked ${appt.patientName} as seen`);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update appointment');
    } finally {
      setBusyId(null);
    }
  };

  const bucket = (a) => {
    const d = a.appointmentDate;
    if (d === today) return 'Today';
    if (d > today) return 'Upcoming';
    return 'Past';
  };

  const counts = useMemo(() => {
    const c = { Today: 0, Upcoming: 0, Past: 0, All: rows.length };
    rows.forEach((a) => { c[bucket(a)] += 1; });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, today]);

  const filteredRows = useMemo(() => {
    if (filter === 'All') return rows;
    return rows.filter((a) => bucket(a) === filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, filter, today]);

  return (
    <section className="animate-fade-up space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">🩺 Appointments</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          📅 My appointments
        </h1>
        <p className="mt-1 text-sm text-ink-600">Patients assigned to you. Approved ones for today are up top to review.</p>
      </header>

      {/* To see today */}
      <div className="rounded-3xl border border-ink-200/70 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-lg">🩺</span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">To see today</h2>
            <p className="text-xs text-ink-500">
              {todaysToSee.length ? `${todaysToSee.length} approved patient(s) scheduled today` : 'No approved patients scheduled for today'}
            </p>
          </div>
        </div>

        {todaysToSee.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {todaysToSee.map((a, i) => (
              <div
                key={a.id ?? i}
                style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}
                className="animate-fade-up rounded-2xl border border-brand-200/60 bg-brand-50/30 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {(a.patientName || 'P').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-900">{a.patientName || 'Patient'}</p>
                    <p className="truncate text-xs text-ink-500">🕒 {a.appointmentTime || '—'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => markSeen(a)}
                  className="mt-3 w-full rounded-xl bg-brand-600 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.97] disabled:opacity-60"
                >
                  {busyId === a.id ? 'Saving…' : '✅ Mark as seen'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {TIME_TABS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={[
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
              filter === f.key ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50',
            ].join(' ')}
          >
            {f.emoji} {f.key}
            <span className={`rounded-full px-1.5 text-[10px] ${filter === f.key ? 'bg-white/25' : 'bg-ink-100 text-ink-500'}`}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-100" />)}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">📭</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No appointments here</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((a, i) => {
            const patient = (a.patientName || 'Patient').trim();
            const demo = [a.patientAge && `${a.patientAge}y`, a.patientGender, a.patientMobile].filter(Boolean).join(' · ');
            return (
              <div
                key={a.id ?? i}
                style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
                className="animate-fade-up rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                      {patient.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-900">{patient}</p>
                      <p className="truncate text-xs text-ink-500">{demo || '—'}</p>
                    </div>
                  </div>
                  <StatusPill status={a.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm">📅</span>
                    <div className="min-w-0"><p className="text-[10px] font-semibold text-ink-400">Date</p><p className="truncate text-xs font-bold text-ink-800">{a.appointmentDate || '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-50 text-sm">🕒</span>
                    <div className="min-w-0"><p className="text-[10px] font-semibold text-ink-400">Time</p><p className="truncate text-xs font-bold text-ink-800">{a.appointmentTime || '—'}</p></div>
                  </div>
                </div>

                {a.notes && <p className="mt-2 line-clamp-2 text-xs text-ink-500">📝 {a.notes}</p>}

                {a.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => markSeen(a)}
                    className="mt-3 w-full rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97] disabled:opacity-60"
                  >
                    {busyId === a.id ? 'Saving…' : '✅ Mark seen'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
