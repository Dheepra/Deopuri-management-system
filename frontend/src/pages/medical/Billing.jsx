import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStock, createBill, getBills } from '../../services/medicalLedger.js';
import { printBill } from '../../utils/printBill.js';
import { whatsappBill, getShopDetails, saveShopDetails } from '../../utils/billTools.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const inputCls =
  'w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
// Compact input for the item rows — NO w-full, so qty/rate stay on one line.
const rowInput =
  'rounded-lg border border-ink-200 bg-white px-2 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

const blankItem = () => ({ productName: '', quantity: '1', salePrice: '' });

export default function Billing() {
  const [stock, setStock] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paid, setPaid] = useState('');
  const [items, setItems] = useState([blankItem()]);
  const [lastBill, setLastBill] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [shop, setShop] = useState(getShopDetails());

  const load = async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([getStock().catch(() => []), getBills().catch(() => [])]);
      setStock(s || []);
      setBills(b || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stockByName = useMemo(() => {
    const m = new Map();
    stock.forEach((s) => m.set(s.productName, s));
    return m;
  }, [stock]);

  const setItem = (i, patch) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addRow = () => setItems((prev) => [...prev, blankItem()]);
  const removeRow = (i) => setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const onPick = (i, name) => {
    const st = stockByName.get(name);
    setItem(i, { productName: name, salePrice: st?.retailPrice != null ? String(st.retailPrice) : '' });
  };

  const runningTotal = useMemo(
    () =>
      items.reduce((sum, it) => {
        const qty = Number(it.quantity) || 0;
        const price = it.salePrice !== '' ? Number(it.salePrice) : (stockByName.get(it.productName)?.retailPrice ?? 0);
        return sum + qty * price;
      }, 0),
    [items, stockByName],
  );

  const generate = async () => {
    const clean = items
      .filter((it) => it.productName.trim() && Number(it.quantity) > 0)
      .map((it) => ({
        productName: it.productName.trim(),
        quantity: Number(it.quantity),
        salePrice: it.salePrice === '' ? null : Number(it.salePrice),
      }));
    if (clean.length === 0) {
      toast.error('Add at least one medicine');
      return;
    }
    setSaving(true);
    try {
      const bill = await createBill({
        customerName: customerName.trim() || null,
        customerMobile: customerMobile.trim() || null,
        billDate: null,
        paidAmount: paid === '' ? null : Number(paid),
        items: clean,
      });
      toast.success(`Bill ${bill.billNumber} created`);
      setLastBill(bill);
      setCustomerName('');
      setCustomerMobile('');
      setPaid('');
      setItems([blankItem()]);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not generate bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">🧾 Billing</h1>
          <p className="text-sm text-ink-500">Create and print a medicine bill for the customer — auto-added to P&amp;L.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowShop(true)} className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">⚙️ Shop details</button>
          <Link to="/medical/profit-loss" className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">📊 P&amp;L</Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Bill builder */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900">New bill</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className={inputCls} placeholder="👤 Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input className={inputCls} placeholder="📱 Mobile (optional)" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} />
          </div>

          {/* Column header */}
          <div className="mt-4 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
            <span className="flex-1">Medicine</span>
            <span className="w-14 text-center">Qty</span>
            <span className="w-20">Rate</span>
            <span className="hidden w-20 text-right sm:block">Amount</span>
            <span className="w-8" />
          </div>

          <div className="mt-1 space-y-1.5">
            {items.map((it, i) => {
              const st = stockByName.get(it.productName);
              const qty = Number(it.quantity) || 0;
              const price = it.salePrice !== '' ? Number(it.salePrice) : (st?.retailPrice ?? 0);
              return (
                <div key={i} className="flex items-center gap-2">
                  {stock.length > 0 ? (
                    <select className={`${rowInput} min-w-0 flex-1`} value={it.productName} onChange={(e) => onPick(i, e.target.value)}>
                      <option value="">Select medicine…</option>
                      {stock.map((s) => (
                        <option key={s.id} value={s.productName}>{s.productName} ({s.quantity})</option>
                      ))}
                    </select>
                  ) : (
                    <input className={`${rowInput} min-w-0 flex-1`} placeholder="Medicine" value={it.productName} onChange={(e) => setItem(i, { productName: e.target.value })} />
                  )}
                  <input className={`${rowInput} w-14 text-center`} type="number" placeholder="1" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} />
                  <input className={`${rowInput} w-20`} type="number" placeholder={st?.retailPrice ?? '₹'} value={it.salePrice} onChange={(e) => setItem(i, { salePrice: e.target.value })} />
                  <span className="hidden w-20 shrink-0 text-right text-sm font-semibold text-ink-700 sm:block">{inr(qty * price)}</span>
                  <button onClick={() => removeRow(i)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Remove">✕</button>
                </div>
              );
            })}
          </div>

          <button onClick={addRow} className="mt-2.5 rounded-lg border border-dashed border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50">➕ Add medicine</button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
            <div className="flex items-center gap-3">
              <span className="font-display text-lg font-bold text-brand-700">Total: {inr(runningTotal)}</span>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                💵 Received
                <input className={`${rowInput} w-24`} type="number" placeholder={String(Math.round(runningTotal))} value={paid} onChange={(e) => setPaid(e.target.value)} />
              </label>
              {paid !== '' && runningTotal - Number(paid) > 0 && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">Udhaar {inr(runningTotal - Number(paid))}</span>
              )}
            </div>
            <button onClick={generate} disabled={saving} className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{saving ? 'Generating…' : '🧾 Generate bill'}</button>
          </div>
          <p className="mt-1 text-[11px] text-ink-400">Leave "Received" empty for fully paid. Enter less and the balance goes to the customer's khata (credit).</p>

          {lastBill && (
            <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-brand-800">
                  ✅ Bill {lastBill.billNumber} · {inr(lastBill.totalAmount)}
                  {lastBill.dueAmount > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Due {inr(lastBill.dueAmount)}</span>}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => whatsappBill(lastBill)} className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white hover:brightness-95">💬 WhatsApp</button>
                  <button onClick={() => printBill(lastBill)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700">🖨️ Print</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent bills */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Recent bills</h2>
          {loading ? (
            <p className="py-4 text-center text-sm text-ink-400">Loading…</p>
          ) : bills.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No bills yet</p>
          ) : (
            <ul className="space-y-2">
              {bills.slice(0, 12).map((b) => (
                <li key={b.billNumber} className="flex items-center justify-between gap-2 rounded-xl border border-ink-100 p-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-800">{b.billNumber}</p>
                    <p className="truncate text-xs text-ink-400">{b.customerName || 'Walk-in'} · {b.itemCount} items · {b.billDate ? new Date(b.billDate).toLocaleDateString('en-IN') : '—'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="font-bold text-ink-900">{inr(b.totalAmount)}</span>
                    <button onClick={() => whatsappBill(b)} className="rounded-lg border border-ink-200 px-2 py-1 text-xs hover:bg-ink-50" title="WhatsApp">💬</button>
                    <button onClick={() => printBill(b)} className="rounded-lg border border-ink-200 px-2 py-1 text-xs text-ink-600 hover:bg-ink-50" title="Print">🖨️</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showShop && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowShop(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-ink-900">⚙️ Shop details</h2>
            <p className="mb-4 text-xs text-ink-500">These print on the bill/invoice (GST, license). Saved in this browser.</p>
            <div className="space-y-3">
              <input className={inputCls} placeholder="GSTIN (optional)" value={shop.gstin || ''} onChange={(e) => setShop({ ...shop, gstin: e.target.value })} />
              <input className={inputCls} placeholder="Drug license no. (optional)" value={shop.license || ''} onChange={(e) => setShop({ ...shop, license: e.target.value })} />
              <input className={inputCls} placeholder="Shop address (optional)" value={shop.address || ''} onChange={(e) => setShop({ ...shop, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Phone (optional)" value={shop.phone || ''} onChange={(e) => setShop({ ...shop, phone: e.target.value })} />
                <input className={inputCls} type="number" placeholder="GST % (e.g. 12)" value={shop.gstRate ?? ''} onChange={(e) => setShop({ ...shop, gstRate: e.target.value })} />
              </div>
              <p className="text-[11px] text-ink-400">Enter a GST % to show an MRP-inclusive tax breakup on the invoice (total stays the same).</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowShop(false)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
              <button onClick={() => { saveShopDetails(shop); setShowShop(false); toast.success('Shop details saved'); }} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
