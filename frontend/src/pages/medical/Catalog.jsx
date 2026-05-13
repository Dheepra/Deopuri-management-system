import { useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { fetchProducts } from '../../services/products.js';

function tone(qty) {
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
        {row.description && <p className="line-clamp-1 text-xs text-ink-500">{row.description}</p>}
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
    render: (row) => <span className="font-semibold text-ink-900">{row.quantity ?? '—'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const qty = row.quantity ?? 0;
      return <Badge tone={tone(qty)}>{qty === 0 ? 'Out' : qty < 50 ? 'Low' : 'Healthy'}</Badge>;
    },
  },
];

export default function Catalog() {
  const { data, loading, refresh } = useAsyncData(() => fetchProducts());
  const [search, setSearch] = useState('');

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Catalog</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Medicines in stock
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Live from <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">/api/products</code>.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search medicine" className="sm:w-72" />
          <Button size="md" variant="secondary" onClick={refresh}>Refresh</Button>
          <Button size="md">Add medicine</Button>
        </div>
      </header>

      <Table
        columns={COLUMNS}
        rows={data ?? []}
        search={search}
        loading={loading}
        pageSize={10}
        empty={{
          title: 'Catalog is empty',
          description: 'Add your first medicine to start tracking stock.',
        }}
      />
    </section>
  );
}
