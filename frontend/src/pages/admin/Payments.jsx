import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders } from "../../services/adminOrders";
import { addPayment } from "../../services/adminPayments";
import { downloadCsv, todayStamp } from "../../utils/exportCsv.js";

// Payment-status pill styling + emoji, so every badge below stays consistent.
const paymentMeta = (status) => {
  switch (status) {
    case "PAID":
      return { label: "Paid", emoji: "✅", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    case "PARTIALLY_PAID":
      return { label: "Partial", emoji: "🟡", pill: "bg-amber-50 text-amber-700 ring-amber-200" };
    default:
      return { label: status || "Unpaid", emoji: "❌", pill: "bg-red-50 text-red-700 ring-red-200" };
  }
};

const PaymentPill = ({ status }) => {
  const m = paymentMeta(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
};

// Derive a combined payment status for a customer from their summed paid/remaining.
const customerStatus = (paid, remaining) => {
  if (remaining <= 0 && paid > 0) return "PAID";
  if (paid > 0) return "PARTIALLY_PAID";
  return "UNPAID";
};

export default function Payments() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  // "order" = one row per order (default). "customer" = orders combined per customer (amounts added).
  const [view, setView] = useState("order");

  // Per-customer "collect" modal state. customerName is chosen in the modal (or preset from a row).
  const [showCollect, setShowCollect] = useState(false);
  const [collectForm, setCollectForm] = useState({ customerName: "", amount: "", method: "CASH", remark: "" });
  const [collecting, setCollecting] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await fetchAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  const handleApply = () => {
    let result = [...orders];

    if (fromDate) {
      result = result.filter(
        (o) => new Date(o.orderDate) >= new Date(fromDate)
      );
    }

    if (toDate) {
      result = result.filter(
        (o) => new Date(o.orderDate) <= new Date(toDate + "T23:59:59")
      );
    }

    if (search) {
      result = result.filter(
        (o) =>
          o.userName?.toLowerCase().includes(search.toLowerCase()) ||
          o.orderNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredOrders(result);
  };

  // Payments are only relevant once an order is fulfilled, so show ONLY delivered orders — and one
  // row per order number.
  const uniqueOrders = [];
  const map = new Map();

  filteredOrders
    .filter((o) => o.status === "DELIVERED")
    .forEach((o) => {
      if (!map.has(o.orderNumber)) {
        map.set(o.orderNumber, o);
      }
    });

  map.forEach((value) => uniqueOrders.push(value));

  // Per-customer roll-up: sum each customer's delivered orders into a single row.
  const customerMap = new Map();
  uniqueOrders.forEach((o) => {
    const key = o.userName || "—";
    const cur = customerMap.get(key) || {
      userName: key, orders: 0, total: 0, paid: 0, remaining: 0, lastDate: null,
    };
    cur.orders += 1;
    cur.total += Number(o.totalAmount) || 0;
    cur.paid += Number(o.paidAmount) || 0;
    cur.remaining += Number(o.remainingAmount) || 0;
    const d = o.orderDate ? new Date(o.orderDate) : null;
    if (d && (!cur.lastDate || d > cur.lastDate)) cur.lastDate = d;
    customerMap.set(key, cur);
  });
  const customerRows = [...customerMap.values()];

  const isCustomer = view === "customer";
  const count = isCustomer ? customerRows.length : uniqueOrders.length;

  // Customers who still owe money — used by the collect modal's dropdown.
  const dueCustomers = customerRows.filter((c) => c.remaining > 0);
  const selectedCustomer = customerRows.find((c) => c.userName === collectForm.customerName) || null;
  const selectedDue = selectedCustomer ? selectedCustomer.remaining : 0;

  // Drill from a customer row into that customer's individual orders.
  const drillToCustomer = (name) => {
    setSearch(name);
    setView("order");
    setFilteredOrders(
      orders.filter((o) => o.userName?.toLowerCase() === name.toLowerCase())
    );
  };

  // A customer's delivered orders that still have a balance, oldest first, one per order number.
  const dueOrdersFor = (name) => {
    const seen = new Set();
    return orders
      .filter((o) => o.status === "DELIVERED" && o.userName === name && Number(o.remainingAmount) > 0)
      .filter((o) => {
        if (seen.has(o.orderNumber)) return false;
        seen.add(o.orderNumber);
        return true;
      })
      .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
  };

  // Open the modal with a specific customer preselected (from a row).
  const openCollectFor = (c) => {
    setCollectForm({ customerName: c.userName, amount: String(c.remaining || ""), method: "CASH", remark: "" });
    setShowCollect(true);
  };

  // Open the modal from the header — preselect the first customer who owes money (if any).
  const openCollectTop = () => {
    const first = dueCustomers[0];
    setCollectForm({
      customerName: first ? first.userName : "",
      amount: first ? String(first.remaining) : "",
      method: "CASH",
      remark: "",
    });
    setShowCollect(true);
  };

  const closeCollect = () => {
    setShowCollect(false);
    setCollecting(false);
  };

  const onPickCustomer = (name) => {
    const c = customerRows.find((x) => x.userName === name);
    setCollectForm({ ...collectForm, customerName: name, amount: c ? String(c.remaining) : "" });
  };

  // Apply a lump-sum payment across the customer's pending orders, oldest first. The money is still
  // recorded per order (the source of truth), so both views reflect it after the reload below.
  const submitCollect = async () => {
    if (!collectForm.customerName) {
      alert("Please select a customer.");
      return;
    }
    const amount = Number(collectForm.amount);
    if (!amount || amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    const due = dueOrdersFor(collectForm.customerName);
    if (due.length === 0) {
      alert("This customer has no pending amount.");
      return;
    }

    setCollecting(true);
    let left = amount;
    try {
      for (const o of due) {
        if (left <= 0) break;
        const pay = Math.min(Number(o.remainingAmount), left);
        await addPayment(o.orderNumber, {
          amount: pay,
          paymentMethod: collectForm.method,
          remark: collectForm.remark || `Customer collection (${collectForm.customerName})`,
        });
        left -= pay;
      }

      await loadOrders();
      closeCollect();

      if (left > 0) {
        alert(`Collected ₹${amount - left}. ₹${left} was more than the total due, so it was not applied.`);
      } else {
        alert(`Collected ₹${amount} across ${due.length} order(s). ✅`);
      }
    } catch (err) {
      console.log(err);
      setCollecting(false);
      alert(err.response?.data?.message || "Failed to record payment. Some orders may have been updated — reloading.");
      loadOrders();
    }
  };

  const handleExport = () => {
    if (isCustomer) {
      downloadCsv(`payments-by-customer-${todayStamp()}.csv`, customerRows, [
        { header: "Customer", value: (c) => c.userName },
        { header: "Orders", value: (c) => c.orders },
        { header: "Total", value: (c) => c.total },
        { header: "Paid", value: (c) => c.paid },
        { header: "Remaining", value: (c) => c.remaining },
        { header: "Payment status", value: (c) => customerStatus(c.paid, c.remaining) },
      ]);
      return;
    }
    downloadCsv(`payments-${todayStamp()}.csv`, uniqueOrders, [
      { header: "Order #", value: (o) => o.orderNumber },
      { header: "Customer", value: (o) => o.userName },
      { header: "Order date", value: (o) => formatDate(o.orderDate) },
      { header: "Total", value: (o) => o.totalAmount },
      { header: "Paid", value: (o) => o.paidAmount },
      { header: "Remaining", value: (o) => o.remainingAmount },
      { header: "Payment status", value: (o) => o.paymentStatus },
    ]);
  };

  const tabClass = (active) =>
    `flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
      active ? "bg-brand-600 text-white shadow-sm" : "text-ink-600 hover:bg-white hover:text-ink-900"
    }`;

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">💳 Payments</h1>
          <p className="text-sm text-ink-500">Payments for delivered orders only 🚚</p>
        </div>
        <span key={count} className="animate-pop rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          🧾 {count} {isCustomer ? (count === 1 ? "customer" : "customers") : (count === 1 ? "order" : "orders")}
        </span>
      </div>

      {/* View toggle + top-level Collect */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-full bg-ink-100 p-1">
          <button onClick={() => setView("order")} className={tabClass(!isCustomer)}>
            🧾 Per order
          </button>
          <button onClick={() => setView("customer")} className={tabClass(isCustomer)}>
            👥 Per customer
          </button>
        </div>

        <button
          onClick={openCollectTop}
          disabled={dueCustomers.length === 0}
          title={dueCustomers.length === 0 ? "All customers are fully paid" : "Collect a payment from a customer"}
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          💵 Collect payment
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-500">📅 From date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-auto"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-500">📅 To date</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-auto"
            />
          </label>

          <label className="block min-w-[200px] flex-1">
            <span className="mb-1 block text-xs font-semibold text-ink-500">🔍 Search</span>
            <input
              type="text"
              placeholder="Search customer or order…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <button
            onClick={handleApply}
            className="flex-1 rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99] sm:flex-none"
          >
            ✨ Apply
          </button>

          <button
            onClick={handleExport}
            className="flex-1 rounded-xl border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 sm:flex-none"
          >
            ⬇️ Export CSV
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-400">
                {isCustomer ? (
                  <>
                    <th className="px-4 py-3 font-semibold">👤 Customer</th>
                    <th className="px-4 py-3 text-center font-semibold">🧾 Orders</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold">📦 Order no</th>
                    <th className="px-4 py-3 font-semibold">👤 Customer</th>
                  </>
                )}
                <th className="px-4 py-3 text-center font-semibold">💵 Total</th>
                <th className="px-4 py-3 text-center font-semibold">✅ Paid</th>
                <th className="px-4 py-3 text-center font-semibold">🔴 Remaining</th>
                <th className="px-4 py-3 text-center font-semibold">💳 Status</th>
                <th className="px-4 py-3 text-center font-semibold">📅 {isCustomer ? "Last order" : "Date"}</th>
                <th className="px-4 py-3 text-center font-semibold">⚙️ Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-ink-50">
              {count === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="text-4xl">📭</div>
                    <p className="mt-2 text-sm font-semibold text-ink-600">No delivered orders yet</p>
                    <p className="text-xs text-ink-400">Payments show up here once an order is marked delivered.</p>
                  </td>
                </tr>
              ) : isCustomer ? (
                customerRows.map((c, i) => (
                  <tr
                    key={c.userName}
                    style={{ animationDelay: `${Math.min(i, 15) * 40}ms` }}
                    className="animate-fade-up transition-colors hover:bg-ink-50/50"
                  >
                    <td className="px-4 py-3 font-semibold text-ink-900">{c.userName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">{c.orders}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-ink-800">₹{c.total}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600">₹{c.paid}</td>
                    <td className="px-4 py-3 text-center font-semibold text-red-600">₹{c.remaining}</td>
                    <td className="px-4 py-3 text-center"><PaymentPill status={customerStatus(c.paid, c.remaining)} /></td>
                    <td className="px-4 py-3 text-center text-ink-600">{c.lastDate ? c.lastDate.toLocaleDateString("en-IN") : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {c.remaining > 0 && (
                          <button
                            onClick={() => openCollectFor(c)}
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97]"
                          >
                            💵 Collect
                          </button>
                        )}
                        <button
                          onClick={() => drillToCustomer(c.userName)}
                          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                        >
                          🔎 Orders
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                uniqueOrders.map((order, i) => (
                  <tr
                    key={order.orderNumber}
                    style={{ animationDelay: `${Math.min(i, 15) * 40}ms` }}
                    className="animate-fade-up transition-colors hover:bg-ink-50/50"
                  >
                    <td className="px-4 py-3 font-semibold text-ink-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-ink-700">{order.userName}</td>
                    <td className="px-4 py-3 text-center font-semibold text-ink-800">₹{order.totalAmount}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-600">₹{order.paidAmount}</td>
                    <td className="px-4 py-3 text-center font-semibold text-red-600">₹{order.remainingAmount}</td>
                    <td className="px-4 py-3 text-center"><PaymentPill status={order.paymentStatus} /></td>
                    <td className="px-4 py-3 text-center text-ink-600">{formatDate(order.orderDate)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/admin/payments/${order.orderNumber}`)}
                        className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97]"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect payment modal */}
      {showCollect && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="animate-pop w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">

            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">💵 Collect payment</h3>
                <p className="text-xs text-ink-500">Applied to the customer's oldest order first</p>
              </div>
              <button
                onClick={closeCollect}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close"
              >✕</button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">👤 Customer</span>
              <select
                value={collectForm.customerName}
                onChange={(e) => onPickCustomer(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Select customer…</option>
                {dueCustomers.map((c) => (
                  <option key={c.userName} value={c.userName}>
                    {c.userName} — ₹{c.remaining} due
                  </option>
                ))}
              </select>
            </label>

            <div className="mb-4 rounded-xl bg-red-50 p-3 text-center">
              <p className="text-xs font-semibold text-red-600">Total due</p>
              <p className="text-2xl font-bold text-red-600">₹{selectedDue}</p>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Amount to collect</span>
              <input
                type="number"
                min="0"
                value={collectForm.amount}
                onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Enter amount"
              />
              {selectedDue > 0 && (
                <button
                  type="button"
                  onClick={() => setCollectForm({ ...collectForm, amount: String(selectedDue) })}
                  className="mt-1 text-xs font-semibold text-brand-600 hover:underline"
                >
                  Pay full ₹{selectedDue}
                </button>
              )}
            </label>

            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Method</span>
              <select
                value={collectForm.method}
                onChange={(e) => setCollectForm({ ...collectForm, method: e.target.value })}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="CASH">💵 Cash</option>
                <option value="UPI">📱 UPI</option>
                <option value="CARD">💳 Card</option>
                <option value="BANK_TRANSFER">🏦 Bank transfer</option>
              </select>
            </label>

            <label className="mb-4 block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Remark (optional)</span>
              <input
                type="text"
                value={collectForm.remark}
                onChange={(e) => setCollectForm({ ...collectForm, remark: e.target.value })}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="e.g. paid at counter"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={closeCollect}
                className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
              >
                ✖ Cancel
              </button>
              <button
                onClick={submitCollect}
                disabled={collecting}
                className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.99] disabled:opacity-60"
              >
                {collecting ? "⏳ Saving…" : "✅ Collect"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
