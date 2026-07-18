import { useEffect, useState } from "react";
import {
  fetchAllOrders,
  updateOrderStatus,
} from "../../services/adminOrders";
import { updateOrderAmount } from "../../services/adminOrders";
import { downloadCsv, todayStamp } from "../../utils/exportCsv.js";

// Visual metadata for each order status — keeps the pill/label/emoji consistent everywhere below.
const statusMeta = (status) => {
  switch (status) {
    case "PENDING":
      return { label: "Pending", emoji: "⏳", pill: "bg-amber-50 text-amber-700 ring-amber-200", accent: "border-l-amber-400" };
    case "CONFIRMED":
      return { label: "Confirmed", emoji: "✅", pill: "bg-sky-50 text-sky-700 ring-sky-200", accent: "border-l-sky-400" };
    case "DELIVERED":
      return { label: "Delivered", emoji: "🚚", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", accent: "border-l-emerald-500" };
    default:
      return { label: status || "—", emoji: "•", pill: "bg-ink-100 text-ink-600 ring-ink-200", accent: "border-l-ink-300" };
  }
};

const StatusPill = ({ status }) => {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [search, setSearch] = useState("");
const [filteredOrders, setFilteredOrders] = useState([]);

  const loadOrders = async () => {
  const data = await fetchAllOrders();

  console.log("Orders =", data);

  setOrders(data);
};

  const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
};

  useEffect(() => {
  loadOrders();
}, []);

useEffect(() => {
  setFilteredOrders(orders);
}, [orders]);

const groupedOrders = filteredOrders.reduce((acc, order) => {
  const date = order.orderDate.split("T")[0];

  if (!acc[date]) {
    acc[date] = {};
  }

  const groupId = order.orderGroupId;

  if (!acc[date][groupId]) {
    acc[date][groupId] = [];
  }

  acc[date][groupId].push(order);

  return acc;
}, {});

  const handleStatusChange = async (id, status) => {
  try {
    await updateOrderStatus(id, status);
    loadOrders();
  } catch (err) {
    console.log(err.response?.data);

    alert(
      err.response?.data?.message ||
      "Failed to update order status."
    );
  }
};

  const handleAmountChange = async (id, amount) => {
  try {
    await updateOrderAmount(id, amount);
    loadOrders();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to update amount."
    );
  }
};

const handleConfirm = async (groupOrders) => {
  try {

    // Check if every product has amount
    const hasEmptyAmount = groupOrders.some((order) => {
  const amount = Number(order.productAmount);

  return (
    order.productAmount === null ||
    order.productAmount === undefined ||
    String(order.productAmount).trim() === "" ||
    isNaN(amount) ||
    amount <= 0
  );
});



    if (hasEmptyAmount) {
      alert("Please enter amount for all medicines before confirming.");
      return;
    }

    await updateOrderStatus(groupOrders[0].id, "CONFIRMED");

loadOrders();

  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to confirm order."
    );
  }
};

const handleDeliver = async (groupOrders) => {
  try {
    await updateOrderStatus(
      groupOrders[0].id,
      "DELIVERED"
    );

    await loadOrders();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to deliver order."
    );
  }
};

const handleApply = () => {
  let result = [...orders];

  // Compare on the plain YYYY-MM-DD part so timezone offsets can't push a
  // same-day order out of range (the earlier Date-object compare did that).
  if (fromDate) {
    result = result.filter((o) => (o.orderDate?.split("T")[0] ?? "") >= fromDate);
  }

  if (toDate) {
    result = result.filter((o) => (o.orderDate?.split("T")[0] ?? "") <= toDate);
  }

  if (search) {
    result = result.filter(
      (o) =>
        o.userName?.toLowerCase().includes(search.toLowerCase()) ||
        o.productName?.toLowerCase().includes(search.toLowerCase())
    );
  }

  setFilteredOrders(result);
};

const handleClear = () => {
  setFromDate("");
  setToDate("");
  setSearch("");
  setFilteredOrders(orders);
};

const hasFilters = Boolean(fromDate || toDate || search);

// Count distinct orders (not line-item rows) so the badge matches the cards shown.
const orderCount = new Set(
  filteredOrders.map((o) => o.orderGroupId ?? o.orderNumber)
).size;

const hasOrders = Object.keys(groupedOrders).length > 0;

return (
  <div className="animate-fade-up space-y-4">

    {/* Page header */}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">🛒 Orders</h1>
        <p className="text-sm text-ink-500">Review, price &amp; fulfil customer orders</p>
      </div>
      <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
        🧾 {orderCount} order{orderCount === 1 ? "" : "s"}
      </span>
    </div>

    {/* Filters */}
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-500">📅 From date</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-500">📅 To date</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block min-w-[220px] flex-1">
          <span className="mb-1 block text-xs font-semibold text-ink-500">🔍 Search</span>
          <input
            type="text"
            placeholder="Search customer or medicine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <button
          onClick={handleApply}
          className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 active:scale-[.99]"
        >
          ✨ Apply
        </button>

        {hasFilters && (
          <button
            onClick={handleClear}
            className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50 active:scale-[.99]"
          >
            ✖ Clear
          </button>
        )}

        <button
          onClick={() =>
            downloadCsv(`orders-${todayStamp()}.csv`, filteredOrders, [
              { header: "Order #", value: (o) => o.orderNumber },
              { header: "Customer", value: (o) => o.userName },
              { header: "Date", value: (o) => formatDate(o.orderDate) },
              { header: "Medicine", value: (o) => o.productName },
              { header: "Quantity", value: (o) => o.quantity },
              { header: "Product Total", value: (o) => o.productAmount },
              { header: "Order Total", value: (o) => o.totalAmount },
              { header: "Status", value: (o) => o.status },
            ])
          }
          className="rounded-xl border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          ⬇️ Export CSV
        </button>

      </div>
    </div>

    {/* Empty state */}
    {!hasOrders && (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
        <div className="text-4xl">📭</div>
        <p className="mt-2 text-sm font-semibold text-ink-600">No orders found</p>
        <p className="text-xs text-ink-400">Try adjusting the date range or search above.</p>
      </div>
    )}

    {/* Orders grouped by date */}
    <div className="space-y-6">

      {Object.entries(groupedOrders)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([date, groupMap], gi) => (

          <div
            key={date}
            style={{ animationDelay: `${Math.min(gi, 10) * 60}ms` }}
            className="animate-fade-up space-y-3"
          >

            {/* Date label */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">
                📅 {formatDate(date)}
              </span>
              <span className="h-px flex-1 bg-ink-100" />
            </div>

            {/* Groups */}
           {Object.entries(groupMap).map(([groupId, groupOrders]) => {

  const totalAmount = groupOrders.reduce(
  (sum, item) => sum + (Number(item.productAmount) || 0),
  0
);

  const status = groupOrders[0].status;

  const m = statusMeta(status);
  return (
              <div
                key={groupId}
                className={`overflow-hidden rounded-2xl border border-ink-200 border-l-4 bg-white shadow-sm transition-shadow hover:shadow-card-hover ${m.accent}`}
              >

                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/70 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 text-sm font-bold text-white">
                      {(groupOrders[0].userName?.[0] || "?").toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-ink-900">{groupOrders[0].userName}</h3>
                        <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          📦 #{groupOrders[0].orderNumber}
                        </span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500">
                        📍 {groupOrders[0].deliveryAddress}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={status} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-400">
                        <th className="px-4 py-2 font-semibold">💊 Medicine</th>
                        <th className="px-4 py-2 font-semibold">💰 Price</th>
                        <th className="px-4 py-2 font-semibold">🔢 Qty</th>
                        <th className="px-4 py-2 font-semibold">🧾 Product total</th>
                        <th className="px-4 py-2 font-semibold">📌 Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-ink-50">
                      {groupOrders.map((o) => (
                        <tr key={o.id} className="transition-colors hover:bg-ink-50/50">

                          <td className="px-4 py-2.5 font-medium text-ink-800">{o.productName}</td>

                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <span className="text-ink-400">₹</span>
                              <input
                                type="number"
                                value={o.productPrice ?? ""}
                                disabled={
                                  o.status === "CONFIRMED" ||
                                  o.status === "DELIVERED"
                                }
                                onChange={(e) =>
                                  setOrders((prev) =>
                                    prev.map((item) =>
                                      item.id === o.id
                                        ? {
                                            ...item,
                                            productPrice: e.target.value,
                                          }
                                        : item
                                    )
                                  )
                                }
                                onBlur={(e) =>
                                  handleAmountChange(o.id, Number(e.target.value))
                                }
                                className="w-24 rounded-lg border border-ink-200 px-2 py-1 text-sm outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400"
                              />
                            </div>
                          </td>

                          <td className="px-4 py-2.5 text-ink-700">{o.quantity}</td>

                          <td className="px-4 py-2.5 font-semibold text-ink-800">₹ {o.productAmount}</td>

                          <td className="px-4 py-2.5"><StatusPill status={o.status} /></td>

                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/60 px-4 py-2.5">

                    <p className="flex items-center gap-1.5 text-sm font-bold text-brand-700">
                      💵 Total: ₹{groupOrders[0].totalAmount}
                    </p>

                    {status === "PENDING" && (
                      <button
                        onClick={() => handleConfirm(groupOrders)}
                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[.97]"
                      >
                        ✅ Confirm order
                      </button>
                    )}

                    {status === "CONFIRMED" && (
                      <button
                        onClick={() => handleDeliver(groupOrders)}
                        className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.97]"
                      >
                        🚚 Mark delivered
                      </button>
                    )}

                    {status === "DELIVERED" && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        ✔ Delivered
                      </span>
                    )}
                  </div>

                </div>

              </div>
              );
})}

          </div>

        ))}

    </div>

  </div>
);
}
