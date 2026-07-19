import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getMedicalExpenses,
  addMedicalExpense,
  deleteMedicalExpense,
} from '../../services/medicalLedger.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const inputCls =
  'w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

const TYPES = ['Rent', 'Salary', 'Electricity', 'Transport', 'Other'];
const EMPTY = { expenseName: '', expenseType: 'Rent', amount: '', description: '', expenseDate: '' };

export default function MedicalExpenses() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getMedicalExpenses());
    } catch {
      toast.error('Could not load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(() => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0), [rows]);

  const submit = async () => {
    if (!form.expenseName.trim() || form.amount === '') {
      toast.error('Name and amount are required');
      return;
    }
    setSaving(true);
    try {
      await addMedicalExpense({
        expenseName: form.expenseName.trim(),
        expenseType: form.expenseType,
        amount: Number(form.amount),
        description: form.description.trim() || null,
        expenseDate: form.expenseDate || null,
      });
      toast.success('Expense added');
      setForm(EMPTY);
      setShow(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not add expense');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteMedicalExpense(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Could not delete');
    }
  };

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">🧮 Expenses</h1>
            <p className="text-sm text-ink-500">Rent, salary, electricity, etc. — these are deducted in P&amp;L.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">Total {inr(total)}</span>
            <button onClick={() => setShow(true)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">➕ Add expense</button>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
            <div className="text-4xl">🧮</div>
            <p className="mt-2 text-sm font-semibold text-ink-600">No expenses yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...rows].sort((a, b) => new Date(b.expenseDate || 0) - new Date(a.expenseDate || 0)).map((r) => (
              <div key={r.id} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-ink-900">{r.expenseName}</h3>
                    <span className="mt-1 inline-block rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">{r.expenseType || 'Other'}</span>
                  </div>
                  <p className="shrink-0 font-display text-lg font-bold text-rose-600">{inr(r.amount)}</p>
                </div>
                {r.description && <p className="mt-2 line-clamp-2 text-xs text-ink-500">{r.description}</p>}
                <div className="mt-3 flex items-center justify-between border-t border-ink-50 pt-2 text-xs">
                  <span className="text-ink-400">{r.expenseDate ? new Date(r.expenseDate).toLocaleDateString('en-IN') : '—'}</span>
                  <button onClick={() => remove(r.id)} className="font-semibold text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {show && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShow(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900">➕ Add expense</h2>
            <div className="space-y-3">
              <input className={inputCls} placeholder="Expense name (e.g. Shop rent)" value={form.expenseName} onChange={(e) => setForm({ ...form, expenseName: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className={inputCls} value={form.expenseType} onChange={(e) => setForm({ ...form, expenseType: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className={inputCls} type="number" placeholder="Amount ₹" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <input className={inputCls} type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
              <textarea className={inputCls} rows={2} placeholder="Notes (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShow(false)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
              <button onClick={submit} disabled={saving} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{saving ? 'Saving…' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
