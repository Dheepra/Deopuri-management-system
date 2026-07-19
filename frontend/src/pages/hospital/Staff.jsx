import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { email as emailValidator, phone10, required, runValidators } from '../../utils/validators.js';
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../../services/staff.js';

const EMPTY_FORM = {
  name: '',
  role: '',
  department: '',
  shift: 'Day',
  status: 'active',
  email: '',
  mobileNo: '',
};

// Soft gradient per avatar so the grid feels lively but stays on-brand.
const AVATAR_GRADIENTS = [
  "from-brand-500 to-brand-700",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
];

const statusMeta = (s) => {
  const k = (s || "").toLowerCase();
  if (k === "active") return { label: "Active", emoji: "🟢", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (k === "on-leave" || k === "on leave") return { label: "On leave", emoji: "🌴", pill: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (k === "inactive") return { label: "Inactive", emoji: "⚪", pill: "bg-ink-100 text-ink-500 ring-ink-200" };
  return { label: s || "Active", emoji: "🩺", pill: "bg-sky-50 text-sky-700 ring-sky-200" };
};

function StatusPill({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
}

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

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  const staff = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) =>
      (s?.name || '').toLowerCase().includes(q)
      || (s?.department || '').toLowerCase().includes(q)
      || (s?.role || '').toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <>
    <section className="animate-fade-up space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            🏥 Medical staff
          </p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            🧑‍⚕️ Staff
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700">
              {(data ?? []).length}
            </span>
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Nurses, lab techs, pharmacists &amp; support staff across departments.
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

      {/* Staff cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">🧑‍⚕️</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No staff yet</p>
          <p className="text-xs text-ink-400">Add your first team member to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((s, i) => {
            const fullName = (s?.name || 'Unknown').trim();
            const initial = fullName.charAt(0).toUpperCase() || 'S';
            const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            const nightShift = (s?.shift || '').toLowerCase() === 'night';
            return (
              <div
                key={s?.id ?? i}
                style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}
                className="group animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-lg font-bold text-white transition-transform group-hover:scale-110`}>
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-900">{fullName}</p>
                    <p className="truncate text-xs text-ink-500">🩺 {s?.role || '—'}</p>
                  </div>
                  <StatusPill status={s?.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-ink-50 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-ink-400">🏥 Department</p>
                    <p className="truncate text-xs font-bold text-ink-800">{s?.department || '—'}</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold text-ink-400">{nightShift ? '🌙 Shift' : '☀️ Shift'}</p>
                    <p className="text-xs font-bold text-ink-800">{s?.shift || '—'}</p>
                  </div>
                </div>

                {(s?.email || s?.mobileNo) && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                    {s?.email && <span className="truncate">📧 {s.email}</span>}
                    {s?.mobileNo && <span>📱 {s.mobileNo}</span>}
                  </div>
                )}

                <div className="mt-3 flex gap-2 border-t border-ink-50 pt-3">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97]"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="flex-1 rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-[.97]"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>

    {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="animate-pop flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

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
    </>
  );
}
