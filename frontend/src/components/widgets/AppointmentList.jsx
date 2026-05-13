import Badge from '../ui/Badge.jsx';

const TONE = {
  Scheduled: 'info',
  Completed: 'success',
  'No-show': 'warning',
  Cancelled: 'danger',
};

export default function AppointmentList({ appointments }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">Upcoming today</h3>
          <p className="text-xs text-ink-500">{appointments.length} appointments scheduled</p>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          View calendar
        </button>
      </header>

      <ul className="divide-y divide-ink-100">
        {appointments.map((appt) => (
          <li
            key={appt.id}
            className="grid grid-cols-[64px_1fr_auto] items-center gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div className="text-center">
              <p className="font-display text-sm font-semibold text-ink-900">{appt.time}</p>
              <p className="text-[11px] uppercase tracking-wider text-ink-400">{appt.duration}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">{appt.patient}</p>
              <p className="truncate text-xs text-ink-500">
                {appt.doctor} · {appt.department}
              </p>
            </div>
            <Badge tone={TONE[appt.status] ?? 'neutral'}>{appt.status}</Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
