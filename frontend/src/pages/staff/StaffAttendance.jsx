import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Table from '../../components/ui/Table.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMyAttendance, markAttendance } from '../../services/staffPortal.js';

const columns = [
  { key: 'date', header: 'Date' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone="success">{row.status}</Badge>,
  },
  {
    key: 'markedAt',
    header: 'Marked at',
    render: (row) =>
      row.markedAt ? new Date(row.markedAt).toLocaleString() : '—',
  },
];

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
    [data]
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Staff portal
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            My attendance
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Mark today&apos;s attendance and review your history.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMark}
          disabled={marking}
          className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:opacity-60"
        >
          {marking ? 'Marking…' : '🟢 Mark attendance'}
        </button>
      </header>

      <Table columns={columns} rows={rows} loading={loading} pageSize={10} />
    </section>
  );
}
