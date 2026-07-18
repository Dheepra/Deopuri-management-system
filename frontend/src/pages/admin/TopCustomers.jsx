import { useEffect, useState } from "react";
import {
  getTopCustomers,
  getAllOffers,
  assignOffer,
} from "../../services/offers";

const medal = (rank) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`);

// Accent stripe for the podium cards — gold / silver / bronze.
const rankAccent = (rank) =>
  rank === 1
    ? "from-amber-400 to-yellow-500"
    : rank === 2
    ? "from-slate-300 to-slate-400"
    : "from-orange-400 to-amber-600";

const PERIODS = [
  { value: "1M", label: "🗓️ 1 Month" },
  { value: "3M", label: "🗓️ 3 Months" },
  { value: "6M", label: "🗓️ 6 Months" },
  { value: "9M", label: "🗓️ 9 Months" },
  { value: "1Y", label: "🗓️ 1 Year" },
];

export default function TopCustomers() {

  const [customers, setCustomers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("1M");

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState("");

  useEffect(() => {
    loadCustomers();
  }, [period]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getTopCustomers(period);
      setCustomers(data || []);
    } catch (error) {
      console.log(error);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (customer) => {
    try {
      const data = await getAllOffers();
      setOffers(data);
      setSelectedUser(customer);
      setSelectedOffer("");
      setShowModal(true);
    } catch (error) {
      console.log(error);
      alert("Unable to load offers");
    }
  };

  const handleAssignOffer = async () => {
    if (!selectedOffer) {
      alert("Please select an offer");
      return;
    }

    try {
      await assignOffer({
        userId: selectedUser.userId,
        offerId: Number(selectedOffer),
      });

      alert("Offer Assigned Successfully");
      setShowModal(false);
    } catch (error) {
      console.log(error);
      alert("Failed to assign offer");
    }
  };

  const podium = customers.slice(0, 3);
  const rest = customers.slice(3);

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">🏆 Top Customers</h1>
          <p className="text-sm text-ink-500">Your biggest spenders — reward them with an offer 🎁</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-12 text-center">
          <div className="text-4xl">🧑‍🤝‍🧑</div>
          <p className="mt-2 text-sm font-semibold text-ink-600">No customers in this period</p>
          <p className="text-xs text-ink-400">Try a longer time range above.</p>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {podium.map((c, i) => (
              <div
                key={c.userId}
                style={{ animationDelay: `${i * 80}ms` }}
                className="group relative animate-fade-up overflow-hidden rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${rankAccent(c.rank)}`} />

                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink-50 text-2xl transition-transform group-hover:scale-110">
                    {medal(c.rank)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink-900">{c.userName}</p>
                    <p className="truncate text-xs text-ink-500">🏬 {c.shopName || "—"}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-brand-50 p-2 text-center">
                    <p className="text-[11px] font-semibold text-brand-600">💰 Spent</p>
                    <p className="text-sm font-bold text-brand-700">₹{c.totalPayment}</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-2 text-center">
                    <p className="text-[11px] font-semibold text-ink-500">📦 Orders</p>
                    <p className="text-sm font-bold text-ink-800">{c.totalOrders}</p>
                  </div>
                </div>

                <button
                  onClick={() => openAssignModal(c)}
                  className="mt-3 w-full rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97]"
                >
                  🎁 Assign offer
                </button>
              </div>
            ))}
          </div>

          {/* The rest */}
          {rest.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
              {rest.map((c, i) => (
                <div
                  key={c.userId}
                  style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
                  className="flex animate-fade-up flex-wrap items-center gap-3 border-t border-ink-50 px-4 py-3 transition-colors first:border-t-0 hover:bg-ink-50/50"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
                    {c.rank}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{c.userName}</p>
                    <p className="truncate text-xs text-ink-400">🏬 {c.shopName || "—"}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-700">₹{c.totalPayment}</p>
                    <p className="text-[11px] text-ink-400">📦 {c.totalOrders} orders</p>
                  </div>

                  <button
                    onClick={() => openAssignModal(c)}
                    className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    🎁 Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Assign offer modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="animate-pop w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">

            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">🎁 Assign offer</h3>
                <p className="text-xs text-ink-500">Reward this customer</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                aria-label="Close"
              >✕</button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">👤 Customer</span>
              <input
                value={selectedUser?.userName || ""}
                readOnly
                className="w-full rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm text-ink-700"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">🏷️ Select offer</span>
              <select
                value={selectedOffer}
                onChange={(e) => setSelectedOffer(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Select offer…</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.offerName} (
                    {offer.offerType === "PERCENTAGE"
                      ? `${offer.discountValue}%`
                      : `₹${offer.discountValue}`}
                    )
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
              >
                ✖ Cancel
              </button>
              <button
                onClick={handleAssignOffer}
                className="flex-[1.5] rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.99]"
              >
                ✅ Assign
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
