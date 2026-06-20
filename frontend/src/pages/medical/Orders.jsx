import { useEffect, useMemo, useState } from "react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchProducts } from "../../services/products";
import { placeOrder, fetchMyOrders } from "../../services/orders";
import Button from "../../components/ui/Button";
import { getAuthUser } from "../../services/auth";

export default function MedicalOrders() {

  // UI STATES
  const [search, setSearch] = useState("");
  const [showProducts, setShowProducts] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  // CART + ORDERS
  const [selectedVariants, setSelectedVariants] = useState({});


  const user = getAuthUser();
const userId = user?.id;
const role = user?.role;

const CART_KEY = `cart_${role}_${userId}`;

const [cart, setCart] = useState(() => {
  const user = getAuthUser();
  if (!user) return [];

  const key = `cart_${user.role}_${user.id}`;
  const saved = localStorage.getItem(key);

  return saved ? JSON.parse(saved) : [];
});
  const [orders, setOrders] = useState([]);

  const user = getAuthUser();

  // PRODUCTS API
  const { data: products, loading } = useAsyncData(() =>
    fetchProducts()
  );

  // FILTER PRODUCTS
  const filteredProducts = useMemo(() => {
    const items = products ?? [];
    if (!search) return items;

    return items.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // SAVE CART LOCAL STORAGE
  useEffect(() => {
  if (userId && role) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}, [cart, CART_KEY]);

  // LOAD ORDERS FROM BACKEND
  const loadOrders = async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(data || []);
    } catch (err) {
      console.log("Order Load Error:", err);
    }
  };

  useEffect(() => {
    if (showOrders) {
      loadOrders();
    }
  }, [showOrders]);

  // ADD TO CART (MERGE SAME PRODUCT + SIZE)
  const addToCart = (product, variantId) => {
    if (!variantId) {
      alert("Please select size");
      return;
    }

    const variant = product.variants.find(v => v.id === variantId);

    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === product.id &&
          i.variantId === variant.id
      );

      if (existing) {
        return prev.map((i) =>
          i.productId === product.id &&
          i.variantId === variant.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
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
      prev.map((i) =>
        i.cartId === cartId
          ? { ...i, quantity: qty === "" ? "" : Number(qty) }
          : i
      )
    );
  };

  // REMOVE ITEM
  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  // PLACE ORDER API CALL
  const handlePlaceOrder = async () => {
    const validItems = cart.filter(
      (i) => i.quantity !== "" && Number(i.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please enter quantity");
      return;
    }

    try {
      for (const item of validItems) {
        await placeOrder({
          productId: item.productId,
          variantId: item.variantId,
          quantity: Number(item.quantity),
        });
      }

      alert("Order placed successfully");

      setCart([]);
localStorage.removeItem(CART_KEY);

      loadOrders();
      setShowOrders(true);

    } catch (err) {
      console.log("Order Error =", err);
      alert("Failed to place order");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* TOP NAV */}
      <div className="flex gap-4 mb-6">

        <button
          onClick={() => {
            setShowProducts(true);
            setShowCart(false);
            setShowOrders(false);
          }}
          className="px-4 py-2 rounded text-white"
          style={{ backgroundColor: "#157d58" }}
        >
          Products
        </button>

        <button
          onClick={() => {
            setShowProducts(false);
            setShowCart(true);
            setShowOrders(false);
          }}
          className="px-4 py-2 rounded bg-gray-200"
        >
          Cart ({cart.length})
        </button>

        <button
          onClick={() => {
            setShowProducts(false);
            setShowCart(false);
            setShowOrders(true);
            loadOrders();
          }}
          className="px-4 py-2 rounded bg-gray-200"
        >
          Orders ({orders.length})
        </button>

      </div>

      {/* PRODUCTS */}
      {showProducts && (
        <div className="grid grid-cols-3 gap-4">

          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded shadow">

              <img
                src={p.imageUrl}
                className="h-32 w-full object-cover rounded"
              />

              <h3 className="font-semibold mt-2">{p.name}</h3>

              <select
                className="border w-full mt-2 p-1"
                onChange={(e) =>
                  setSelectedVariants({
                    ...selectedVariants,
                    [p.id]: Number(e.target.value),
                  })
                }
              >
                <option value="">Select size</option>
                {p.variants?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.size}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  addToCart(p, selectedVariants[p.id])
                }
                className="w-full mt-2 text-white py-2 rounded"
                style={{ backgroundColor: "#157d58" }}
              >
                Add to Cart
              </button>

            </div>
          ))}

        </div>
      )}

      {/* CART */}
      {showCart && (
        <div className="bg-white p-4 rounded shadow">

          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartId}
                className="flex justify-between border-b py-2"
              >
                <div>
                  <p className="font-medium">{item.name}</p>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.cartId, e.target.value)
                    }
                    className="border w-20 mt-1"
                  />
                </div>

                <button
                  onClick={() => removeFromCart(item.cartId)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <button
              onClick={handlePlaceOrder}
              className="w-full mt-4 text-white py-2 rounded"
              style={{ backgroundColor: "#157d58" }}
            >
              Place Order
            </button>
          )}

        </div>
      )}

      {/* ORDERS */}
      {showOrders && (
        <div className="bg-white p-4 rounded shadow">

          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="flex justify-between border-b py-2"
              >

                <div>
                  <p className="font-semibold">
                    {o.productName}
                  </p>

                  <p className="text-sm text-gray-500">
                    Size: {o.size} | Qty: {o.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p>₹{o.totalAmount}</p>

                  <span className="text-xs px-2 py-1 rounded text-white"
                    style={{ backgroundColor: "#157d58" }}
                  >
                    {o.status}
                  </span>
                </div>

              </div>
            ))
          )}

        </div>
      )}

    </div>
  );
}