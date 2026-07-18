import { useAsyncData } from '../../hooks/useAsyncData.js';
import { fetchProducts } from '../../services/products.js';
import { useMemo, useState, useEffect } from 'react';
import { getAuthUser } from "../../services/auth.js";
import { placeAllOrders, fetchMyOrders } from '../../services/orders.js';

const getImageUrl = (url) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http")) return url;
  return `http://localhost:8080${url}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
};

const statusMeta = (status) => {
  switch (status) {
    case "PENDING":
      return { label: "Pending", emoji: "⏳", pill: "bg-amber-50 text-amber-700 ring-amber-200" };
    case "CONFIRMED":
      return { label: "Confirmed", emoji: "✅", pill: "bg-sky-50 text-sky-700 ring-sky-200" };
    case "SHIPPED":
      return { label: "Shipped", emoji: "📮", pill: "bg-violet-50 text-violet-700 ring-violet-200" };
    case "DELIVERED":
      return { label: "Delivered", emoji: "🚚", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    default:
      return { label: status || "—", emoji: "•", pill: "bg-ink-100 text-ink-600 ring-ink-200" };
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

export default function Orders() {

  const [search, setSearch] = useState('');
  const [showProducts, setShowProducts] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [payFilter, setPayFilter] = useState('all');

  const [selectedVariants, setSelectedVariants] = useState({});

  const [orders, setOrders] = useState([]);

  const user = getAuthUser();
  const userId = user?.id;
  const role = user?.role;

  const CART_KEY = `cart_${role}_${userId}`;

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // PRODUCTS
  const { data: products, loading } = useAsyncData(() => fetchProducts());

  const filteredProducts = useMemo(() => {
    const items = products ?? [];
    if (!search) return items;

    return items.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // SAVE CART
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, CART_KEY]);

  // LOAD ORDERS
  const loadOrders = async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (showOrders) {
      loadOrders();
    }
  }, [showOrders]);

  const groupedOrders = orders.reduce((acc, order) => {
    if (!order.orderDate) return acc;

    const date = order.orderDate.split("T")[0];
    if (!acc[date]) acc[date] = {};

    const orderNo = order.orderNumber;
    if (!acc[date][orderNo]) acc[date][orderNo] = [];

    acc[date][orderNo].push(order);
    return acc;
  }, {});

  // ADD TO CART
  const addToCart = (product, variantId) => {
    if (!variantId) {
      alert("Please select size");
      return;
    }

    const variant = product.variants.find((v) => v.id === variantId);

    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.productId === product.id && item.variantId === variant.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          cartId: `${product.id}-${variant.id}`,
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          imageUrl: product.imageUrl,
          size: variant.size,
          quantity: 1,
        },
      ];
    });
  };

  // UPDATE QTY
  const updateQuantity = (cartId, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: qty === "" ? "" : Number(qty) }
          : item
      )
    );
  };

  // REMOVE
  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    const validItems = cart.filter(
      (i) => i.quantity !== "" && Number(i.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please enter quantity");
      return;
    }

    try {
      await placeAllOrders(validItems);

      alert("Order placed successfully");

      setCart([]);
      localStorage.removeItem(CART_KEY);

      loadOrders();
      setShowProducts(false);
      setShowCart(false);
      setShowOrders(true);
    } catch (err) {
      console.log(err);
    }
  };

  const goTo = (tab) => {
    setShowProducts(tab === "products");
    setShowCart(tab === "cart");
    setShowOrders(tab === "orders");
    setShowPayments(tab === "payments");
    if (tab === "orders" || tab === "payments") loadOrders();
  };

  // Payment status → pill + emoji.
  const payMeta = (status, remaining, paid) => {
    const s = status || (remaining <= 0 && paid > 0 ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "UNPAID");
    if (s === "PAID") return { label: "Paid", emoji: "✅", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (s === "PARTIALLY_PAID") return { label: "Partial", emoji: "🟡", pill: "bg-amber-50 text-amber-700 ring-amber-200" };
    return { label: "Unpaid", emoji: "❌", pill: "bg-red-50 text-red-700 ring-red-200" };
  };

  // One row per order number, with totals — the customer's bill overview.
  const payments = useMemo(() => {
    const seen = new Set();
    const list = [];
    let billed = 0, paid = 0, outstanding = 0;
    orders.forEach((o) => {
      if (!o.orderNumber || seen.has(o.orderNumber)) return;
      seen.add(o.orderNumber);
      const b = Number(o.totalAmount) || 0;
      const p = Number(o.paidAmount) || 0;
      const r = Number(o.remainingAmount) || 0;
      billed += b; paid += p; outstanding += r;
      list.push({
        orderNumber: o.orderNumber, orderDate: o.orderDate,
        billed: b, paid: p, remaining: r, paymentStatus: o.paymentStatus,
      });
    });
    list.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    return { list, billed, paid, outstanding };
  }, [orders]);

  const payFilters = [
    { key: 'all', label: 'All', emoji: '📋' },
    { key: 'UNPAID', label: 'Unpaid', emoji: '❌' },
    { key: 'PARTIALLY_PAID', label: 'Partial', emoji: '🟡' },
    { key: 'PAID', label: 'Paid', emoji: '✅' },
  ];

  const filteredPayments = useMemo(() => {
    if (payFilter === 'all') return payments.list;
    return payments.list.filter((o) => {
      const s = o.paymentStatus || (o.remaining <= 0 && o.paid > 0 ? "PAID" : o.paid > 0 ? "PARTIALLY_PAID" : "UNPAID");
      return s === payFilter;
    });
  }, [payments, payFilter]);

  const tabClass = (active) =>
    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-brand-600 text-white shadow-sm"
        : "text-ink-600 hover:bg-white hover:text-ink-900"
    }`;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="animate-pop text-sm font-semibold text-ink-500">⏳ Loading medicines…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-up p-6">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink-900">🏥 Orders Management</h1>
        <p className="text-sm text-ink-500">Order medicines &amp; track deliveries and payments</p>
      </div>

      {/* Segmented nav */}
      <div className="mb-6 inline-flex flex-wrap gap-1 rounded-full bg-ink-100 p-1">
        <button onClick={() => goTo("products")} className={tabClass(showProducts)}>
          🛍️ Products
        </button>
        <button onClick={() => goTo("cart")} className={tabClass(showCart)}>
          🛒 Cart
          <span key={cart.length} className="animate-pop rounded-full bg-white/25 px-1.5 text-xs">
            {cart.length}
          </span>
        </button>
        <button onClick={() => goTo("orders")} className={tabClass(showOrders)}>
          📦 Orders
          <span key={orders.length} className="animate-pop rounded-full bg-white/25 px-1.5 text-xs">
            {orders.length}
          </span>
        </button>
        <button onClick={() => goTo("payments")} className={tabClass(showPayments)}>
          💳 Payments
        </button>
      </div>

      {/* PRODUCTS */}
      {showProducts && (
        <div className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search medicines…"
            className="mb-4 w-full max-w-md rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
              <div className="text-4xl">🔍</div>
              <p className="mt-2 text-sm font-semibold text-ink-600">No medicines found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((p, i) => (
                <div
                  key={p.id}
                  style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}
                  className="group animate-fade-up overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="overflow-hidden">
                    <img
                      src={getImageUrl(p.imageUrl)}
                      alt={p.name}
                      className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-3">
                    <h3 className="truncate font-semibold text-ink-900">{p.name}</h3>

                    <select
                      onChange={(e) =>
                        setSelectedVariants({
                          ...selectedVariants,
                          [p.id]: Number(e.target.value),
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-ink-200 p-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">Select size</option>
                      {p.variants?.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.size}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => addToCart(p, selectedVariants[p.id])}
                      className="mt-2 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[.97]"
                    >
                      ➕ Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CART */}
      {showCart && (
        <div className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <h2 className="mb-4 text-lg font-bold text-ink-900">🛒 Cart items</h2>

          {cart.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-wiggle text-4xl">🛒</div>
              <p className="mt-2 text-sm font-semibold text-ink-600">Your cart is empty</p>
              <button
                onClick={() => goTo("products")}
                className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                🛍️ Browse medicines
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {cart.map((item, i) => (
                  <div
                    key={item.cartId}
                    style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                    className="flex animate-fade-up items-center justify-between gap-3 rounded-xl border border-ink-100 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">
                          {item.name} <span className="text-ink-400">· {item.size}</span>
                        </p>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.cartId, e.target.value)}
                          className="mt-1 w-20 rounded-lg border border-ink-200 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="rounded-lg px-2 py-1 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePlaceOrder}
                className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[.99]"
              >
                ✅ Place order
              </button>
            </>
          )}
        </div>
      )}

      {/* ORDERS */}
      {showOrders && (
        <div className="animate-fade-up">
          <h2 className="mb-4 text-lg font-bold text-ink-900">📦 Order history</h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
              <div className="text-4xl">📭</div>
              <p className="mt-2 text-sm font-semibold text-ink-600">No orders found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedOrders)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([date, dateOrders]) => (
                  <div key={date}>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-white shadow-sm">
                      <span>📅</span>
                      <h3 className="text-sm font-bold">{formatDate(date)}</h3>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(dateOrders).map(([groupId, groupOrders]) => {
                        const totalAmount = groupOrders[0].totalAmount || 0;
                        const paidAmount = groupOrders[0].paidAmount || 0;
                        const remainingAmount = groupOrders[0].remainingAmount || 0;
                        const paymentStatus = groupOrders[0].paymentStatus || "PENDING";
                        const status = groupOrders[0].status;

                        return (
                          <div
                            key={groupId}
                            className="animate-fade-up overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card"
                          >
                            <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/60 px-4 py-2.5">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700">
                                📦 Order #{groupOrders[0].orderNumber}
                              </span>
                              <StatusPill status={status} />
                            </div>

                            <div className="divide-y divide-ink-50 px-4">
                              {groupOrders.map((o) => (
                                <div key={o.id} className="flex items-center justify-between gap-3 py-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-ink-900">💊 {o.productName}</p>
                                    <p className="text-sm text-ink-500">Size: {o.size} · Qty: {o.quantity}</p>
                                    <p className="text-xs text-ink-400">Ordered: {formatDate(o.orderDate)}</p>
                                  </div>
                                  <div className="font-semibold text-ink-800">₹{o.productAmount}</div>
                                </div>
                              ))}
                            </div>

                            {/* Payment details */}
                            <div className="m-4 rounded-xl bg-ink-50 p-4">
                              <h4 className="mb-3 flex items-center gap-1.5 font-bold text-ink-800">💰 Payment details</h4>

                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <p className="text-xs text-ink-500">Total</p>
                                  <p className="font-bold text-ink-900">₹{totalAmount}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-ink-500">Paid</p>
                                  <p className="font-bold text-emerald-600">₹{paidAmount}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-ink-500">Remaining</p>
                                  <p className="font-bold text-red-600">₹{remainingAmount}</p>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center gap-2 text-sm">
                                <span className="font-semibold text-ink-600">Payment status:</span>
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                                  💳 {paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* PAYMENTS */}
      {showPayments && (
        <div className="animate-fade-up">
          {/* Summary tiles */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">🧾 Total billed</p>
              <p className="mt-1 text-2xl font-bold text-ink-900">₹{payments.billed}</p>
            </div>
            <div className="animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-sm" style={{ animationDelay: '60ms' }}>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">✅ Paid</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">₹{payments.paid}</p>
            </div>
            <div className="animate-fade-up rounded-2xl border border-red-100 bg-red-50/50 p-4 shadow-sm" style={{ animationDelay: '120ms' }}>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">🔴 You owe</p>
              <p className="mt-1 text-2xl font-bold text-red-600">₹{payments.outstanding}</p>
            </div>
          </div>

          {/* Filter chips */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {payFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setPayFilter(f.key)}
                className={[
                  'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
                  payFilter === f.key
                    ? 'bg-brand-600 text-white ring-brand-600'
                    : 'bg-white text-ink-700 ring-ink-200 hover:bg-ink-50',
                ].join(' ')}
              >
                {f.emoji} {f.label}
              </button>
            ))}
          </div>

          {filteredPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
              <div className="text-4xl">💳</div>
              <p className="mt-2 text-sm font-semibold text-ink-600">No payment records</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPayments.map((o, i) => {
                const m = payMeta(o.paymentStatus, o.remaining, o.paid);
                const pct = o.billed > 0 ? Math.min(100, Math.round((o.paid / o.billed) * 100)) : 0;
                return (
                  <div
                    key={o.orderNumber}
                    style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                    className="group animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700">
                        📦 #{o.orderNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.pill}`}>
                        <span>{m.emoji}</span>{m.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-ink-400">📅 {formatDate(o.orderDate)}</p>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-ink-400">{pct}% paid</p>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-ink-50 py-1.5">
                        <p className="text-[10px] text-ink-400">Total</p>
                        <p className="text-xs font-bold text-ink-800">₹{o.billed}</p>
                      </div>
                      <div className="rounded-lg bg-ink-50 py-1.5">
                        <p className="text-[10px] text-ink-400">Paid</p>
                        <p className="text-xs font-bold text-emerald-600">₹{o.paid}</p>
                      </div>
                      <div className="rounded-lg bg-ink-50 py-1.5">
                        <p className="text-[10px] text-ink-400">Remaining</p>
                        <p className="text-xs font-bold text-red-600">₹{o.remaining}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
