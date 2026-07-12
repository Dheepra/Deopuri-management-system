import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Table from '../../components/ui/Table.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMyAppointments, setAppointmentStatus } from '../../services/doctorAppointments.js';

const STATUS_TONE = {
  BOOKED: 'info',
  CONFIRMED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

// Time-based views so the doctor can see past, today's, and future appointments.
const TIME_TABS = ['Today', 'Upcoming', 'Past', 'All'];

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

  // "To see today" = admin-approved (CONFIRMED) appointments scheduled for today.
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

  const filteredRows = useMemo(() => {
    if (filter === 'All') return rows;
    return rows.filter((a) => {
      const d = a.appointmentDate;
      if (filter === 'Today') return d === today;
      if (filter === 'Upcoming') return d > today;
      if (filter === 'Past') return d < today;
      return true;
    });
  }, [rows, filter, today]);

  const columns = [
    {
      key: 'patientName',
      header: 'Patient',
      render: (row) => (
        <div>
          <p className="font-medium text-ink-900">{row.patientName}</p>
          <p className="text-xs text-ink-500">
            {[row.patientAge && `${row.patientAge}y`, row.patientGender, row.patientMobile]
              .filter(Boolean)
              .join(' · ') || '—'}
          </p>
        </div>
      ),
    },
    { key: 'appointmentDate', header: 'Date' },
    { key: 'appointmentTime', header: 'Time' },
    { key: 'notes', header: 'Notes', render: (row) => row.notes || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'info'}>{row.status}</Badge>,
    },
  ];

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Appointments
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          My appointments
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Patients assigned to you. Approved ones for today are shown up top to review.
        </p>
      </header>

      {/* Today's patients to see */}
      <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-lg">🩺</span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">To see today</h2>
            <p className="text-xs text-ink-500">
              {todaysToSee.length
                ? `${todaysToSee.length} approved patient(s) scheduled today`
                : 'No approved patients scheduled for today'}
            </p>
          </div>
        </div>

        {todaysToSee.length > 0 && (
          <ul className="space-y-2">
            {todaysToSee.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-ink-50/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">
                    {a.appointmentTime} · {a.patientName}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {[a.patientAge && `${a.patientAge}y`, a.patientGender, a.notes]
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
        )}
      </div>

      {/* All appointments */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {TIME_TABS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                'rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
                filter === f
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          rows={filteredRows}
          loading={loading}
          pageSize={8}
          actions={(row) =>
            row.status === 'CONFIRMED' ? (
              <button
                type="button"
                disabled={busyId === row.id}
                onClick={() => markSeen(row)}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                ✅ Seen
              </button>
            ) : (
              <span className="text-xs text-ink-400">—</span>
            )
          }
        />
      </div>
    </section>
  );
}
