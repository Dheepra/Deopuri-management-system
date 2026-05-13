import { useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getInventoryFromBackend } from '../../services/hospital.js';

function stockTone(qty) {
  if (qty == null) return 'neutral';
  if (qty === 0) return 'danger';
  if (qty < 50) return 'warning';
  return 'success';
}

const COLUMNS = [
  {
    key: 'name',
    header: 'Medicine',
    render: (row) => (
      <div>
        <p className="font-medium text-ink-900">{row.name}</p>
        {row.description && (
          <p className="line-clamp-1 text-xs text-ink-500">{row.description}</p>
        )}
      </div>
    ),
  },
  {
    key: 'price',
    header: 'Price',
    align: 'right',
    render: (row) => `₹${(row.price ?? 0).toLocaleString('en-IN')}`,
  },
  {
    key: 'quantity',
    header: 'Stock',
    align: 'right',
    render: (row) => (
      <span className="font-semibold text-ink-900">{row.quantity ?? '—'}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const qty = row.quantity ?? 0;
      const label = qty === 0 ? 'Out of stock' : qty < 50 ? 'Low' : 'Healthy';
      return <Badge tone={stockTone(qty)}>{label}</Badge>;
    },
  },
];

export default function Inventory() {
  const { data, loading, error, refresh } = useAsyncData(({ signal }) =>
    getInventoryFromBackend({ signal }),
  );
  const [search, setSearch] = useState('');

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Inventory
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Medicine status
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Live from <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs text-ink-700">/api/products</code>. Low-stock items are flagged.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name"
            className="sm:w-72"
          />
          <Button size="md" variant="secondary" onClick={refresh}>
            Refresh
          </Button>
          <Button size="md">Add medicine</Button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load inventory. The backend may be offline.
        </div>
      )}

      <Table
        columns={COLUMNS}
        rows={data ?? []}
        search={search}
        loading={loading}
        pageSize={10}
        empty={{
          title: 'Catalog is empty',
          description: 'Add your first medicine to start tracking stock.',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M3 7h18M5 7v13h14V7" />
            </svg>
          ),
        }}
      />
    </section>
  );
}
