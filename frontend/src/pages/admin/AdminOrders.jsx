import { useEffect, useState } from "react";
import {
  fetchAllOrders,
  updateOrderStatus,
} from "../../services/adminOrders";
import { updateOrderAmount } from "../../services/adminOrders";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const data = await fetchAllOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    loadOrders(); // refresh
  };
  const handleAmountChange = async (id, amount) => {
  await updateOrderAmount(id, amount);
  loadOrders(); // refresh
};

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Orders</h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th>ID</th>
<th>User</th>
<th>Product</th>
<th>Size</th>
<th>Qty</th>
<th>Amount</th>
<th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b">
              <td>{o.id}</td>
<td>{o.userName}</td>
<td>{o.productName}</td>

<td>{o.variant?.size}</td>  {/* ⭐ ADD THIS */}

<td>{o.quantity}</td>
             <td>
  <input
    type="number"
    value={o.totalAmount || 0}
    onChange={(e) =>
      handleAmountChange(o.id, e.target.value)
    }
    className="border w-24 p-1"
  />
</td>

              <td>
                <select
                  value={o.status}
                  onChange={(e) =>
                    handleStatusChange(o.id, e.target.value)
                  }
                  className="border p-1"
                >
                  <option>PENDING</option>
                  <option>CONFIRMED</option>
                  <option>SHIPPED</option>
                  <option>DELIVERED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}