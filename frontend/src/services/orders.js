import { http } from "./http";

// PLACE ORDER
export async function placeOrder(payload) {
  const { data } = await http.post(
    `/deopuri/orders`,
    payload
  );
  return data;
}

export async function placeAllOrders(orders) {
  const { data } = await http.post("/deopuri/orders/place-all", orders);
  return data;
}

// GET ORDERS OF USER (hospital/medical admin)
export async function fetchOrders(userId) {
  const { data } = await http.get(
    `/deopuri/orders/user/${userId}`
  );
  return data;
}

// OPTIONAL: GET MY ORDERS (best future-proof)
export async function fetchMyOrders() {
  const { data } = await http.get(
    `/deopuri/orders/me`
  );
  return data;
}