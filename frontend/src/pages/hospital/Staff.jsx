import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Table from '../../components/ui/Table.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { email as emailValidator, phone10, required, runValidators } from '../../utils/validators.js';
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../../services/staff.js';

const STATUS_TONE = { active: 'success', 'on-leave': 'warning', inactive: 'neutral' };

const EMPTY_FORM = {
  name: '',
  role: '',
  department: '',
  shift: 'Day',
  status: 'active',
  email: '',
  mobileNo: '',
};

function validate(values) {
  return {
    name: runValidators(values.name, required('Name')),
    role: runValidators(values.role, required('Role')),
    department: runValidators(values.department, required('Department')),
    shift: runValidators(values.shift, required('Shift')),
    status: runValidators(values.status, required('Status')),
    email: runValidators(values.email, required('Email'), emailValidator),
    mobileNo: runValidators(values.mobileNo, required('Mobile'), phone10),
  };
}

export default function Staff() {
  const { data, loading, refresh } = useAsyncData((opts) => getStaff(opts));
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
    { key: 'shift', header: 'Shift' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'neutral'}>{row.status}</Badge>,
    },
  ];

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the field error as the user edits it (follows SignupForm.jsx).
    setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name ?? '',
      role: row.role ?? '',
      department: row.department ?? '',
      shift: row.shift ?? 'Day',
      status: row.status ?? 'active',
      email: row.email ?? '',
      mobileNo: row.mobileNo ?? '',
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSave = async () => {
    const nextErrors = validate(form);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        await updateStaff(editId, form);
        toast.success('Staff updated');
      } else {
        await createStaff(form);
        toast.success('Staff added');
      }
      closeModal();
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    try {
      await deleteStaff(row.id);
      toast.success('Staff removed');
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete staff');
    }
  };

  const rows = useMemo(() => data ?? [], [data]);

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
          <Button size="md" onClick={openCreate}>➕ Add staff</Button>
        </div>
      </header>

      <Table
        columns={columns}
        rows={rows}
        search={search}
        loading={loading}
        pageSize={8}
        actions={(row) => (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row)}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-2xl">🧑‍⚕️</span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink-900">
                  {editId ? 'Edit staff' : 'Add staff'}
                </h3>
                <p className="truncate text-xs text-ink-500">
                  {editId ? 'Update this staff member' : 'Add a new member to your team'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="ml-auto grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close"
              >✕</button>
            </div>

            {/* Body (scrolls) */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">🧑 Name</span>
                <input
                  className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="e.g. Nurse Tara Pillai"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">📧 Email (login)</span>
                <input
                  type="email"
                  readOnly={Boolean(editId)}
                  className={`w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${editId ? 'cursor-not-allowed bg-ink-50 text-ink-500' : ''}`}
                  placeholder="e.g. tara@hospital.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                {!editId && (
                  <p className="mt-1 text-xs text-ink-500">
                    An invite with a create-password link will be emailed here.
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">📱 Mobile</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="10-digit mobile"
                  value={form.mobileNo}
                  onChange={(e) => setField('mobileNo', e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                {errors.mobileNo && <p className="mt-1 text-xs text-red-600">{errors.mobileNo}</p>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">🩺 Role</span>
                <input
                  className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="e.g. Senior Nurse"
                  value={form.role}
                  onChange={(e) => setField('role', e.target.value)}
                />
                {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">🏥 Department</span>
                <input
                  className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="e.g. ICU"
                  value={form.department}
                  onChange={(e) => setField('department', e.target.value)}
                />
                {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">⏰ Shift</span>
                <select
                  className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  value={form.shift}
                  onChange={(e) => setField('shift', e.target.value)}
                >
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                </select>
                {errors.shift && <p className="mt-1 text-xs text-red-600">{errors.shift}</p>}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">🟢 Status</span>
                <select
                  className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option value="active">active</option>
                  <option value="on-leave">on-leave</option>
                  <option value="inactive">inactive</option>
                </select>
                {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
              </label>
            </div>

            {/* Footer (sticky) */}
            <div className="flex gap-3 border-t border-ink-100 px-5 py-4 pb-safe">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
              >✖ Cancel</button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] disabled:opacity-60"
              >{saving ? 'Saving…' : editId ? '✅ Update staff' : '✅ Save staff'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
