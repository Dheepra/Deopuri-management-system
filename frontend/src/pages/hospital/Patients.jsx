import { useState } from 'react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getPatients } from '../../services/hospital.js';

const COLUMNS = [
  {
    key: 'name',
    header: 'Patient',
    render: (row) => (
      <div>
        <p className="font-medium text-ink-900">{row.name}</p>
        <p className="text-xs text-ink-500">{row.id}</p>
      </div>
    ),
  },
  { key: 'age',        header: 'Age',       align: 'right' },
  { key: 'gender',     header: 'Gender' },
  { key: 'doctor',     header: 'Doctor' },
  { key: 'condition',  header: 'Condition' },
  { key: 'admittedAt', header: 'Admitted' },
];

export default function Patients() {
  const { data, loading } = useAsyncData(() => getPatients());
  const [search, setSearch] = useState('');

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
            Admissions across all departments. Filter by doctor or condition.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search patient, doctor, condition"
            className="sm:w-72"
          />
          <Button size="md">New admission</Button>
        </div>
      </header>

      <Table
        columns={COLUMNS}
        rows={data ?? []}
        search={search}
        loading={loading}
        pageSize={8}
        actions={(row) => (
          <button type="button" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            Open
          </button>
        )}
      />
    </section>
  );
}
