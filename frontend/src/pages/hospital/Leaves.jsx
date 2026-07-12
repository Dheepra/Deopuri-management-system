import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Table from '../../components/ui/Table.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getLeaves, updateLeaveStatus } from '../../services/hospitalLeaves.js';

const STATUS_TONE = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };
const FILTERS = ['All', 'PENDING', 'APPROVED', 'REJECTED'];

export default function Leaves() {
  const { data, loading, refresh } = useAsyncData((opts) => getLeaves(opts));
  const [filter, setFilter] = useState('All');
  const [busyId, setBusyId] = useState(null);

  const act = async (row, status) => {
    setBusyId(row.id);
    try {
      await updateLeaveStatus(row.id, status);
      toast.success(`Leave ${status.toLowerCase()}`);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update leave');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'staffName', header: 'Staff' },
    { key: 'type', header: 'Type' },
    { key: 'fromDate', header: 'From' },
    { key: 'toDate', header: 'To' },
    { key: 'days', header: 'Days', align: 'right' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'neutral'}>{row.status}</Badge>,
    },
    { key: 'reason', header: 'Reason', render: (row) => row.reason || '—' },
  ];

  const rows = useMemo(() => {
    const base = data ?? [];
    return filter === 'All' ? base : base.filter((l) => l.status === filter);
  }, [data, filter]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Staff leaves
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          Leave requests
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Approve or reject leave applications from your staff.
        </p>
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
        columns={columns}
        rows={rows}
        loading={loading}
        pageSize={8}
        actions={(row) =>
          row.status === 'PENDING' ? (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={busyId === row.id}
                onClick={() => act(row, 'APPROVED')}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                ✅ Approve
              </button>
              <button
                type="button"
                disabled={busyId === row.id}
                onClick={() => act(row, 'REJECTED')}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                ✕ Reject
              </button>
            </div>
          ) : (
            <span className="text-xs text-ink-400">—</span>
          )
        }
      />
    </section>
  );
}
