import { http } from "./http";

export async function getAllOffers() {
  const { data } = await http.get("/deopuri/offers");
  return data;
}

export async function createOffer(payload) {
  const { data } = await http.post("/deopuri/offers", payload);
  return data;
}

export async function updateOffer(id, payload) {
  const { data } = await http.put(`/deopuri/offers/${id}`, payload);
  return data;
}

export async function getOfferById(id) {
  const { data } = await http.get(`/deopuri/offers/${id}`);
  return data;
}

export async function getTopCustomers(period) {
  const { data } = await http.get(
    `/deopuri/offers/top-customers?period=${period}`
  );
  return data;
}

export async function assignOffer(payload) {
  const { data } = await http.post("/deopuri/offers/assign", payload);
  return data;
}

export async function getUserOffers(userId) {
  const { data } = await http.get(`/deopuri/offers/user/${userId}`);
  return data;
}