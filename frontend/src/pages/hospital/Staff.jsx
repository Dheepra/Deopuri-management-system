import { useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getStaff } from '../../services/hospital.js';

const STATUS_TONE = { active: 'success', 'on-leave': 'warning', inactive: 'neutral' };

const COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'department', header: 'Department' },
  { key: 'shift', header: 'Shift' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
  },
];

export default function Staff() {
  const { data, loading } = useAsyncData(() => getStaff());
  const [search, setSearch] = useState('');

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Medical staff
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Staff management
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Nurses, lab techs, pharmacists, and support staff across departments.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or department"
            className="sm:w-72"
          />
          <Button size="md">Add staff</Button>
        </div>
      </header>

      <Table
        columns={COLUMNS}
        rows={data ?? []}
        search={search}
        loading={loading}
        pageSize={8}
        actions={(row) => (
          <button
            type="button"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Edit
          </button>
        )}
      />
    </section>
  );
}
