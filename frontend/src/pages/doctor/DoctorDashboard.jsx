import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getProfile } from '../../services/profile.js';
import { getMyAppointments, setAppointmentStatus } from '../../services/doctorAppointments.js';

function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
          <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
          {hint && <p className="text-xs text-ink-400">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { data: profile } = useAsyncData(() => getProfile());
  const { data, loading, refresh } = useAsyncData(() => getMyAppointments());
  const [busyId, setBusyId] = useState(null);

  const rows = useMemo(() => data ?? [], [data]);
  const today = todayStr();

  const toSeeToday = useMemo(
    () => rows.filter((a) => a.status === 'CONFIRMED' && a.appointmentDate === today),
    [rows, today],
  );
  const seenToday = useMemo(
    () => rows.filter((a) => a.status === 'COMPLETED' && a.appointmentDate === today).length,
    [rows, today],
  );
  const uniquePatients = useMemo(
    () => new Set(rows.map((a) => a.patientMobile || a.patientName)).size,
    [rows],
  );

  const firstName = (profile?.firstName || '').trim() || 'Doctor';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Doctor console
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          Hi Dr. {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-600">Here are the patients you need to see today.</p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon="🩺" label="To see today" value={loading ? '—' : toSeeToday.length} hint="approved for today" />
        <StatCard icon="✅" label="Seen today" value={loading ? '—' : seenToday} hint="marked completed" />
        <StatCard icon="👥" label="Total patients" value={loading ? '—' : uniquePatients} hint="all-time" />
      </section>

      {/* Today's patients */}
      <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-lg">📋</span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Today&apos;s patients</h2>
            <p className="text-xs text-ink-500">
              {toSeeToday.length
                ? `${toSeeToday.length} patient(s) to review — mark each once seen`
                : 'Nothing scheduled for today'}
            </p>
          </div>
        </div>

        {toSeeToday.length > 0 ? (
          <ul className="space-y-2">
            {toSeeToday.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-ink-50/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">
                    {a.appointmentTime} · {a.patientName}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {[a.patientAge && `${a.patientAge}y`, a.patientGender, a.patientMobile, a.notes]
                      .filter(Boolean)
                      .join(' · ') || 'No extra details'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => markSeen(a)}
                  className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:opacity-60"
                >
                  {busyId === a.id ? 'Saving…' : '✅ Mark as seen'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-ink-50/60 px-4 py-6 text-center text-sm text-ink-400">
            No approved patients scheduled for today.
          </p>
        )}
      </div>
    </motion.div>
  );
}
