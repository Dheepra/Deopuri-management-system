import { useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getAppointments } from '../../services/hospital.js';

const STATUS_TONE = {
  Scheduled: 'info',
  Completed: 'success',
  'No-show': 'warning',
  Cancelled: 'danger',
};

const COLUMNS = [
  { key: 'time',     header: 'Time' },
  { key: 'duration', header: 'Duration' },
  { key: 'patient',  header: 'Patient' },
  { key: 'doctor',   header: 'Doctor' },
  { key: 'department', header: 'Department' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
  },
];

const FILTERS = ['All', 'Scheduled', 'Completed', 'No-show', 'Cancelled'];

export default function Appointments() {
  const { data, loading } = useAsyncData(() => getAppointments());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = useMemo(() => {
    const base = data ?? [];
    return filter === 'All' ? base : base.filter((a) => a.status === filter);
  }, [data, filter]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Appointments
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Today’s schedule
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Filter by status or search by patient, doctor, or department.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search…"
            className="sm:w-72"
          />
          <Button size="md">Book appointment</Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
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
        columns={COLUMNS}
        rows={rows}
        search={search}
        loading={loading}
        pageSize={8}
      />
    </section>
  );
}
