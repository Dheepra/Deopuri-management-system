import { useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getPatients } from '../../services/patients.js';

// Appointment status → badge tone.
const STATUS_TONE = {
  BOOKED: 'info',
  CONFIRMED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const COLUMNS = [
  {
    key: 'name',
    header: 'Patient',
    render: (row) => (
      <div>
        <p className="font-medium text-ink-900">{row.name}</p>
        <p className="text-xs text-ink-500">{row.mobile || '—'}</p>
      </div>
    ),
  },
  { key: 'age', header: 'Age', align: 'right', render: (row) => row.age ?? '—' },
  { key: 'gender', header: 'Gender', render: (row) => row.gender || '—' },
  { key: 'doctorName', header: 'Doctor', render: (row) => row.doctorName || '—' },
  { key: 'lastVisit', header: 'Last visit', render: (row) => row.lastVisit || '—' },
  { key: 'totalVisits', header: 'Visits', align: 'right', render: (row) => row.totalVisits ?? 0 },
  {
    key: 'status',
    header: 'Status',
    render: (row) =>
      row.status ? (
        <Badge tone={STATUS_TONE[row.status] || 'info'}>{row.status}</Badge>
      ) : (
        '—'
      ),
  },
];

export default function Patients() {
  const { data, loading } = useAsyncData((opts) => getPatients(opts));
  const [search, setSearch] = useState('');

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Patients
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Patients overview
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Everyone who has booked an appointment. Search by patient or doctor.
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search patient, doctor, mobile"
          className="sm:w-72"
        />
      </header>

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
