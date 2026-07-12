import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { applyLeave, getLeaveBalance, getMyLeaves } from '../../services/staffPortal.js';

const STATUS_TONE = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

const EMPTY_FORM = { type: 'CASUAL', fromDate: '', toDate: '', reason: '' };

const COLUMNS = [
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

const inputCls =
  'w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const labelCls = 'mb-1.5 block text-sm font-semibold text-ink-700';

export default function StaffLeaves() {
  const { data: leaves, loading, refresh } = useAsyncData((opts) => getMyLeaves(opts));
  const { data: balance, refresh: refreshBalance } = useAsyncData((opts) => getLeaveBalance(opts));

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
  };

  const validate = (values) => {
    const errs = {};
    if (!values.type) errs.type = 'Leave type is required';
    if (!values.fromDate) errs.fromDate = 'From date is required';
    if (!values.toDate) errs.toDate = 'To date is required';
    if (values.fromDate && values.toDate && values.fromDate > values.toDate) {
      errs.toDate = 'To date must be on or after from date';
    }
    return errs;
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSubmit = async () => {
    const next = validate(form);
    if (Object.values(next).some(Boolean)) {
      setErrors(next);
      return;
    }
    setSaving(true);
    try {
      await applyLeave({
        type: form.type,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason?.trim() || null,
      });
      toast.success('Leave request submitted');
      closeModal();
      refresh();
      refreshBalance();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit leave');
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(() => leaves ?? [], [leaves]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            My leaves
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
            Leave &amp; balance
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Apply for leave and track your requests.
          </p>
        </div>
        <Button size="md" onClick={openModal}>➕ Apply leave</Button>
      </header>

      {/* Balance chips */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Casual left</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">
            {balance?.casualRemaining ?? '—'}
            <span className="text-sm font-medium text-ink-400"> / {balance?.casualTotal ?? 12}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Sick used</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{balance?.sickUsed ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Unpaid used</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{balance?.unpaidUsed ?? 0}</p>
        </div>
      </div>

      <Table columns={COLUMNS} rows={rows} loading={loading} pageSize={8} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">🏖️</span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink-900">Apply for leave</h3>
                <p className="truncate text-xs text-ink-500">Casual leave: 12 per year</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="ml-auto grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close"
              >✕</button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <label className="block">
                <span className={labelCls}>🏷 Leave type</span>
                <select
                  className={inputCls}
                  value={form.type}
                  onChange={(e) => setField('type', e.target.value)}
                >
                  <option value="CASUAL">Casual</option>
                  <option value="SICK">Sick</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelCls}>📅 From</span>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.fromDate}
                    onChange={(e) => setField('fromDate', e.target.value)}
                  />
                  {errors.fromDate && <p className="mt-1 text-xs text-red-600">{errors.fromDate}</p>}
                </label>
                <label className="block">
                  <span className={labelCls}>📅 To</span>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.toDate}
                    onChange={(e) => setField('toDate', e.target.value)}
                  />
                  {errors.toDate && <p className="mt-1 text-xs text-red-600">{errors.toDate}</p>}
                </label>
              </div>

              <label className="block">
                <span className={labelCls}>📝 Reason (optional)</span>
                <textarea
                  rows={3}
                  className={inputCls}
                  placeholder="Brief reason for leave"
                  value={form.reason}
                  onChange={(e) => setField('reason', e.target.value)}
                />
              </label>
            </div>

            <div className="flex gap-3 border-t border-ink-100 px-5 py-4 pb-safe">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
              >✖ Cancel</button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:opacity-60"
              >{saving ? 'Submitting…' : '✅ Submit request'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
