import { http } from "./http";

// GET ALL ORDERS (ADMIN)
export async function fetchAllOrders() {
  const { data } = await http.get("/api/orders");
  return data;
}

// UPDATE STATUS
export async function updateOrderStatus(id, status) {
  const { data } = await http.put(`/api/orders/${id}/status`, {
    status,
  });
  return data;
}

// UPDATE AMOUNT
export async function updateOrderAmount(id, amount) {
  const { data } = await http.put(`/api/orders/${id}/amount?amount=${amount}`);
  return data;
}

// DELETE ORDER
export async function deleteOrder(id) {
  const { data } = await http.delete(`/api/orders/${id}`);
  return data;
}