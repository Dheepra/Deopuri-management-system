import { useAsyncData } from '../../hooks/useAsyncData.js';
import { fetchProducts } from '../../services/products.js';
import Button from '../../components/ui/Button.jsx';
import { useMemo, useState, useEffect } from 'react';
import { getAuthUser } from "../../services/auth.js";
import { placeOrder, fetchMyOrders } from '../../services/orders.js';

export default function Orders() {

  const [search, setSearch] = useState('');
  const [showProducts, setShowProducts] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  

  const [selectedVariants, setSelectedVariants] = useState({});

  const [orders, setOrders] = useState([]);

  // 👇 replace with real auth later
const user = getAuthUser();
const userId = user?.id;
const role = user?.role;

const CART_KEY = `cart_${role}_${userId}`;

// NOW SAFE TO USE
const [cart, setCart] = useState(() => {
  const saved = localStorage.getItem(CART_KEY);
  return saved ? JSON.parse(saved) : [];
});

const getImageUrl = (url) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http")) return url;
  return `http://localhost:8080${url}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
};
  // PRODUCTS
  const { data: products, loading } = useAsyncData(() => fetchProducts());

  const filteredProducts = useMemo(() => {
    const items = products ?? [];
    if (!search) return items;

    return items.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // SAVE CART/.
  useEffect(() => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}, [cart, CART_KEY]);

  // LOAD ORDERS
  const loadOrders = async () => {
  try {
    const data = await fetchMyOrders(); // or fetchOrdersByUser(userId)
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

  if (!acc[date]) {
    acc[date] = [];
  }

  acc[date].push(order);

  return acc;
}, {});


  // ADD TO CART
  const addToCart = (product, variantId) => {
  if (!variantId) {
    alert("Please select size");
    return;
  }

  const variant = product.variants.find(v => v.id === variantId);

  setCart((prev) => {
    const existingItem = prev.find(
      (item) =>
        item.productId === product.id &&
        item.variantId === variant.id
    );

    // ✅ IF SAME PRODUCT + SAME SIZE → INCREASE QTY
    if (existingItem) {
      return prev.map((item) =>
        item.productId === product.id &&
        item.variantId === variant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    // ❗ OTHERWISE NEW CART ITEM
    return [
      ...prev,
      {
        cartId: `${product.id}-${variant.id}`,
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        imageUrl: product.imageUrl,
        size: variant.size,
        quantity: 1
      }
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
      i => i.quantity !== "" && Number(i.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please enter quantity");
      return;
    }

    try {
      for (const item of validItems) {
        await placeOrder(
          {
            productId: item.productId,
            variantId: item.variantId,
            quantity: Number(item.quantity)
          }
        );
       
      }

      alert("Order placed successfully");

      setCart([]);
localStorage.removeItem(CART_KEY);

      loadOrders();

    } catch (err) {
  const msg =
    err?.response?.data ||
    "Failed to place order";

  
}
  };

  if (loading) return <div>Loading...</div>;

  return (

    <div className="p-6 bg-gray-50 min-h-screen">

    

    {/* HEADER */}
    <h1 className="text-2xl font-bold mb-6 text-gray-800">
      Orders Management
    </h1>

    {/* TOP CARDS */}
    <div className="grid grid-cols-3 gap-4 mb-6">

      <div
        onClick={() => {
          setShowProducts(true);
          setShowCart(false);
          setShowOrders(false);
        }}
        className="cursor-pointer bg-white shadow rounded-xl p-4 hover:shadow-md transition"
      >
        <h2 className="text-lg font-semibold">Products</h2>
        <p className="text-sm text-gray-500">Browse medicines</p>
      </div>

      <div
        onClick={() => {
          setShowProducts(false);
          setShowCart(true);
          setShowOrders(false);
        }}
        className="cursor-pointer bg-white shadow rounded-xl p-4 hover:shadow-md transition"
      >
        <h2 className="text-lg font-semibold">
          Cart ({cart.length})
        </h2>
        <p className="text-sm text-gray-500">Pending items</p>
      </div>

      <div
        onClick={() => {
          setShowProducts(false);
          setShowCart(false);
          setShowOrders(true);
        }}
        className="cursor-pointer bg-white shadow rounded-xl p-4 hover:shadow-md transition"
      >
        <h2 className="text-lg font-semibold">
          Orders ({orders.length})
        </h2>
        <p className="text-sm text-gray-500">Order history</p>
      </div>

    </div>

    {/* PRODUCTS */}
    {showProducts && (
      <div className="bg-white p-4 rounded-xl shadow">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicines..."
          className="border p-2 w-full mb-4 rounded"
        />

        <div className="grid grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div key={p.id} className="border rounded-lg p-3 hover:shadow">
             <img
  src={getImageUrl(p.imageUrl)}
  alt={p.name}
  className="w-full h-32 object-cover rounded mb-2"
/>
              <h3 className="font-semibold">{p.name}</h3>

              <select
                onChange={(e) =>
                  setSelectedVariants({
                    ...selectedVariants,
                    [p.id]: Number(e.target.value)
                  })
                }
                className="border w-full mt-2 p-1 rounded"
              >
                <option value="">Select size</option>
                {p.variants?.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.size}
                  </option>
                ))}
              </select>

              <button
  onClick={() => addToCart(p, selectedVariants[p.id])}
  className="w-full mt-2 text-white py-2 rounded-lg font-medium transition hover:opacity-90"
  style={{ backgroundColor: "#157d58" }}
>
  Add to Cart
</button>

            </div>
          ))}
        </div>
      </div>
    )}

    {/* CART */}
    {showCart && (
      <div className="bg-white p-4 rounded-xl shadow">

        <h2 className="text-xl font-semibold mb-4">Cart Items</h2>

        {cart.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          cart.map(item => (
            <div
              key={item.cartId}
              className="flex justify-between items-center border-b py-2"
            >

              <div>
                <img
  src={getImageUrl(item.imageUrl)}
  alt={item.name}
  className="w-14 h-14 object-cover rounded"
/>
                <p className="font-medium">
                  {item.name} ({item.size})
                </p>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.cartId, e.target.value)
                  }
                  className="border w-20 mt-1 p-1 rounded"
                />
              </div>

              <button
                onClick={() => removeFromCart(item.cartId)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>

            </div>
          ))
        )}

        {cart.length > 0 && (
          <Button
            onClick={handlePlaceOrder}
            className="mt-4 w-full"
          >
            Place Order
          </Button>
        )}
      </div>
    )}

   {/* ORDERS */}
{showOrders && (
  <div className="bg-white p-4 rounded-xl shadow">

    <h2 className="text-xl font-semibold mb-4">
      Order History
    </h2>

    {orders.length === 0 ? (
      <p className="text-gray-500">No orders found</p>
    ) : (
      <div className="space-y-3">

        {Object.entries(groupedOrders)
          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
          .map(([date, dateOrders]) => (

            <div key={date} className="mb-6">

              <div className="bg-green-100 p-3 rounded-lg mb-3">
                <h3 className="font-bold text-green-800">
                  📅 {formatDate(date)}
                </h3>
              </div>

              <div className="space-y-3">

                {dateOrders.map((o) => (
                  <div
                    key={o.id}
                    className="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50"
                  >

                    <div>
                      <p className="font-semibold">
                        #{o.id} {o.productName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Size: {o.size} | Qty: {o.quantity}
                      </p>

                      <p className="text-xs text-gray-500">
                        Ordered: {formatDate(o.orderDate)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        ₹{o.totalAmount}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          o.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : o.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-700"
                            : o.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                  </div>
                ))}

              </div>

            </div>
          ))}

      </div>
    )}

  </div>
)}
 </div> 
);
}
