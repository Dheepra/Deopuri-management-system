import { useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMyAppointments } from '../../services/doctorAppointments.js';

const STATUS_TONE = {
  BOOKED: 'info',
  CONFIRMED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

// Collapse the doctor's appointments into one row per unique patient (keyed by mobile, else name).
function toPatients(appointments) {
  const byKey = new Map();
  for (const a of appointments) {
    const key = (a.patientMobile && a.patientMobile.trim()) || `name:${(a.patientName || '').toLowerCase()}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(a);
  }

  return [...byKey.values()].map((visits) => {
    // Most recent visit by date then time.
    const latest = [...visits].sort((x, y) => {
      const dx = `${x.appointmentDate} ${x.appointmentTime}`;
      const dy = `${y.appointmentDate} ${y.appointmentTime}`;
      return dx < dy ? 1 : dx > dy ? -1 : 0;
    })[0];
    const seenCount = visits.filter((v) => v.status === 'COMPLETED').length;
    return {
      id: latest.id,
      name: latest.patientName,
      mobile: latest.patientMobile,
      age: latest.patientAge,
      gender: latest.patientGender,
      lastVisit: latest.appointmentDate,
      lastStatus: latest.status,
      totalVisits: visits.length,
      seenCount,
    };
  });
}

const COLUMNS = [
  {
    key: 'name',
    header: 'Patient',
    render: (row) => (
      <div>
        <p className="font-medium text-ink-900">{row.name}</p>
        <p className="text-xs text-ink-500">
          {[row.age && `${row.age}y`, row.gender, row.mobile].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
    ),
  },
  { key: 'lastVisit', header: 'Last visit', render: (row) => row.lastVisit || '—' },
  { key: 'totalVisits', header: 'Visits', align: 'right', render: (row) => row.totalVisits ?? 0 },
  { key: 'seenCount', header: 'Seen', align: 'right', render: (row) => row.seenCount ?? 0 },
  {
    key: 'lastStatus',
    header: 'Latest',
    render: (row) => <Badge tone={STATUS_TONE[row.lastStatus] ?? 'neutral'}>{row.lastStatus}</Badge>,
  },
];

export default function MyPatients() {
  const { data, loading } = useAsyncData(() => getMyAppointments());
  const [search, setSearch] = useState('');

  const rows = useMemo(() => toPatients(data ?? []), [data]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            My patients
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Patients
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Everyone who has booked an appointment with you. &quot;Seen&quot; counts visits you marked done.
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search patient or mobile"
          className="sm:w-72"
        />
      </header>

      <Table columns={COLUMNS} rows={rows} search={search} loading={loading} pageSize={8} />
    </section>
  );
}
