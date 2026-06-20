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
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState([]);

  // 👇 replace with real auth later
 const userId = getAuthUser()?.id;

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
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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
  

  // ADD TO CART
  const addToCart = (product, variantId) => {
    if (!variantId) {
      alert("Please select size");
      return;
    }

    const variant = product.variants.find(v => v.id === variantId);

    setCart((prev) => [
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
    ]);
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
        loadOrders();
      }

      alert("Order placed successfully");

      setCart([]);
      localStorage.removeItem("cart");

      loadOrders();

    } catch (err) {
  console.log("Order Error =", err);
  console.log("Response =", err.response);
  console.log("Data =", err.response?.data);

  alert("Failed to place order");
}
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">

      {/* TOP CARDS */}
      <div className="flex items-center mb-6 gap-4">

        <div
          onClick={() => {
            setShowProducts(true);
            setShowCart(false);
            setShowOrders(false);
          }}
          className="w-56 cursor-pointer rounded-xl border p-4 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Products</h2>
        </div>

        <div
          onClick={() => {
            setShowProducts(false);
            setShowCart(true);
            setShowOrders(false);
          }}
          className="w-56 cursor-pointer rounded-xl border p-4 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Cart ({cart.length})</h2>
        </div>

        <div
          onClick={() => {
            setShowProducts(false);
            setShowCart(false);
            setShowOrders(true);
          }}
          className="w-56 cursor-pointer rounded-xl border p-4 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Orders ({orders.length})</h2>
        </div>

      </div>

      {/* PRODUCTS */}
      {showProducts && (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="border p-2 w-full mb-4"
          />

          <div className="grid grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="border p-3 rounded">

                <h3>{p.name}</h3>

                <select
                  onChange={(e) =>
                    setSelectedVariants({
                      ...selectedVariants,
                      [p.id]: Number(e.target.value)
                    })
                  }
                  className="border w-full"
                >
                  <option value="">Select size</option>
                  {p.variants?.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.size}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    addToCart(p, selectedVariants[p.id])
                  }
                  className="bg-blue-500 text-white px-2 py-1 mt-2"
                >
                  Add to Cart
                </button>

              </div>
            ))}
          </div>
        </>
      )}

      {/* CART */}
      {showCart && (
        <div className="mt-4 border p-4">
          <h2 className="text-xl font-bold mb-2">Cart</h2>

          {cart.map(item => (
            <div key={item.cartId} className="border p-2 mb-2">

              <p>{item.name} ({item.size})</p>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.cartId, e.target.value)
                }
                className="border w-20"
              />

              <button
                onClick={() => removeFromCart(item.cartId)}
                className="text-red-500 ml-2"
              >
                Remove
              </button>

            </div>
          ))}

          {cart.length > 0 && (
            <Button onClick={handlePlaceOrder}>
              Place Order
            </Button>
          )}
        </div>
      )}

      {/* ORDERS */}
      {showOrders && (
        <div className="mt-4 border p-4">
          <h2 className="text-xl font-bold mb-2">Orders</h2>

          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            orders.map(o => (
              <div key={o.id} className="border p-2 mb-2">

                <p>#{o.id} - {o.productName}</p>
                <p>Qty: {o.quantity}</p>
                <p>Size: {o.size}</p>
                <p>Status: {o.status}</p>
                <p>₹{o.totalAmount}</p>

              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}