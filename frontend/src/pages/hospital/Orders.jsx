import { useAsyncData } from '../../hooks/useAsyncData.js';
import { fetchProducts } from '../../services/products.js';
import Button from '../../components/ui/Button.jsx';
import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useEffect } from "react";


export default function Orders() {
      const [search, setSearch] = useState('');
        const [showProducts, setShowProducts] = useState(false);
        const [showCart, setShowCart] = useState(false);
 const {
  data: products,
  loading,
  refresh
} = useAsyncData(() => fetchProducts());

const filteredProducts = useMemo(() => {
  const items = products ?? [];

  if (!search) return items;

  return items.filter((product) =>
    product.name?.toLowerCase()
      .includes(search.toLowerCase())
  );
}, [products, search]);

const [cart, setCart] = useState(() => {
  const savedCart = localStorage.getItem("cart");
  return savedCart ? JSON.parse(savedCart) : [];
});

useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);


const addToCart = (product) => {
  setCart((prev) => {
    const existing = prev.find(
      (item) => item.id === product.id
    );

    if (existing) {
      return prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      );
    }

    return [
      ...prev,
      {
        ...product,
        quantity: 1
      }
    ];
  });
};

const increaseQty = (id) => {
  setCart((prev) =>
    prev.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
};

const decreaseQty = (id) => {
  setCart((prev) =>
    prev
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

const removeFromCart = (id) => {
  setCart((prev) =>
    prev.filter((item) => item.id !== id)
  );
};

  if (loading) {
    return <div>Loading...</div>;
  }

return (
  <div>

    {/* TOP ROW: Products ---- space ---- Cart */}
    <div className="flex items-center mb-6">

      {/* Products Card */}
      <div
        onClick={() => setShowProducts(!showProducts)}
        className="w-56 cursor-pointer rounded-xl border bg-white p-4 shadow-sm"
      >
        <h2 className="text-xl font-semibold">Products</h2>

        <p className="text-sm text-gray-500">
          View available medicines
        </p>
      </div>

      {/* SPACE BETWEEN */}
      <div className="flex-1"></div>

      {/* Cart Card */}
      <div
        onClick={() => setShowCart(!showCart)}
        className="w-56 cursor-pointer rounded-xl border bg-white p-4 shadow-sm"
      >
        <h2 className="text-xl font-semibold">
          Cart ({cart.length})
        </h2>

        <p className="text-sm text-gray-500">
          View selected products
        </p>
      </div>

    </div>

    {/* PRODUCTS SECTION */}
    {showProducts && (
      <>
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-lg border p-3"
        />

        <div className="flex gap-4 mb-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-40 w-full rounded-lg object-cover"
              />

              <h3 className="mt-3 text-center font-semibold">
                {product.name}
              </h3>

              <Button
                className="mt-3 w-full"
                onClick={() => addToCart(product)}
              >
                Add To Cart
              </Button>
            </div>
          ))}
        </div>
      </>
    )}

    {/* CART SECTION */}
    {showCart && (
      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">

        <h2 className="text-xl font-semibold mb-4">
          Cart ({cart.length})
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-500">
            No products added yet
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="mb-4 rounded-lg border p-3"
            >
              <div className="flex gap-3">

                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-16 w-16 rounded object-cover"
                />

                <div className="flex-1">
                  <h4 className="font-semibold">
                    {item.name}
                  </h4>

                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>

                  <div className="mt-2">
                    <label className="mb-1 block text-sm">
                      Quantity
                    </label>

                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, Number(e.target.value))
                      }
                      className="rounded-lg border p-2"
                    >
                      {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-1 text-sm text-black hover:bg-red-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7L18.133 19.142A2 2 0 0116.138 21H7.862A2 2 0 015.867 19.142L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
                      />
                    </svg>

                    Remove
                  </button>

                </div>

              </div>
            </div>
          ))
        )}

        {cart.length > 0 && (
          <Button className="mt-4 w-full">
            Place Order
          </Button>
        )}

      </div>
    )}

  </div>
);
}