import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getKhata, recordKhataPayment } from '../../services/medicalLedger.js';
import { whatsappText, getShopDetails } from '../../utils/billTools.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const inputCls =
  'w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export default function Khata() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pay, setPay] = useState(null); // { customer, amount }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getKhata());
    } catch {
      toast.error('Could not load khata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalDue = useMemo(() => rows.reduce((s, r) => s + (Number(r.totalDue) || 0), 0), [rows]);

  const remind = (c) => {
    const shop = getShopDetails();
    const name = c.customerName || 'Customer';
    const msg =
      `Hello ${name}, you have ${inr(c.totalDue)} pending at ${shop.name || 'our medical store'}.` +
      ` Please clear it when convenient. Thank you 🙏`;
    whatsappText(c.customerMobile, msg);
  };

  const submitPay = async () => {
    const amt = Number(pay.amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await recordKhataPayment({
        customerName: pay.customer.customerName || null,
        customerMobile: pay.customer.customerMobile || null,
        amount: amt,
      });
      toast.success('Payment recorded');
      setPay(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">📒 Khata (Credit)</h1>
            <p className="text-sm text-ink-500">Customers who owe you — collect payments and send reminders.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">Outstanding {inr(totalDue)}</span>
            <Link to="/medical/billing" className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">🧾 New bill</Link>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-400">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
            <div className="text-4xl">🎉</div>
            <p className="mt-2 text-sm font-semibold text-ink-600">No pending dues</p>
            <p className="text-xs text-ink-400">Everyone has paid up. When a bill is left partly paid, it shows here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((c, i) => (
              <div key={(c.customerMobile || c.customerName || i) + i} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-sm font-bold text-white">
                      {(c.customerName?.[0] || '?').toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-900">{c.customerName || 'Walk-in'}</p>
                      <p className="truncate text-xs text-ink-500">{c.customerMobile || 'No mobile'} · {c.billCount} bills</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">{inr(c.totalDue)}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <MiniStat label="Billed" value={inr(c.totalBilled)} />
                  <MiniStat label="Paid" value={inr(c.totalPaid)} tone="text-emerald-700" />
                </div>
                {c.lastBillDate && <p className="mt-2 text-[11px] text-ink-400">Last bill: {new Date(c.lastBillDate).toLocaleDateString('en-IN')}</p>}

                <div className="mt-3 flex gap-2 border-t border-ink-50 pt-3">
                  <button onClick={() => setPay({ customer: c, amount: String(Math.round(c.totalDue)) })} className="flex-1 rounded-lg bg-brand-600 py-1.5 text-xs font-bold text-white hover:bg-brand-700">💵 Collect</button>
                  <button onClick={() => remind(c)} disabled={!c.customerMobile} className="flex-1 rounded-lg bg-[#25D366] py-1.5 text-xs font-bold text-white hover:brightness-95 disabled:opacity-40" title={c.customerMobile ? 'Send reminder' : 'No mobile'}>💬 Remind</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {pay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setPay(null)}>
          <div className="w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-ink-900">💵 Collect payment</h2>
            <p className="mb-4 text-sm text-ink-500">{pay.customer.customerName || 'Walk-in'} · Due <b className="text-rose-600">{inr(pay.customer.totalDue)}</b></p>
            <label className="block text-xs font-semibold text-ink-500">Amount received
              <input className={inputCls} type="number" autoFocus value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
            </label>
            <p className="mt-1 text-[11px] text-ink-400">Applied to the oldest unpaid bills first.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setPay(null)} className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
              <button onClick={submitPay} disabled={saving} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{saving ? 'Saving…' : 'Collect'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MiniStat({ label, value, tone = 'text-ink-900' }) {
  return (
    <div className="rounded-lg bg-ink-50/70 py-1.5">
      <p className="text-[10px] font-semibold uppercase text-ink-400">{label}</p>
      <p className={`text-xs font-bold ${tone}`}>{value}</p>
    </div>
  );
}
