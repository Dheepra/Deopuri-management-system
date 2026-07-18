import { http } from './http.js';

// Per-medical-admin ledger. The backend derives the owner from the JWT, so no id is needed.

// ---- Stock ----
export async function getStock() {
  const { data } = await http.get('/deopuri/medical/stock');
  return data;
}

export async function addStock(payload) {
  const { data } = await http.post('/deopuri/medical/stock', payload);
  return data;
}

export async function updateStock(id, payload) {
  const { data } = await http.put(`/deopuri/medical/stock/${id}`, payload);
  return data;
}

export async function deleteStock(id) {
  await http.delete(`/deopuri/medical/stock/${id}`);
}

// ---- Sales ----
export async function getSales() {
  const { data } = await http.get('/deopuri/medical/sales');
  return data;
}

export async function recordSale(payload) {
  const { data } = await http.post('/deopuri/medical/sales', payload);
  return data;
}

// ---- Bills / invoices ----
export async function createBill(payload) {
  const { data } = await http.post('/deopuri/medical/bills', payload);
  return data;
}

export async function getBills() {
  const { data } = await http.get('/deopuri/medical/bills');
  return data;
}

export async function getBill(billNumber) {
  const { data } = await http.get(`/deopuri/medical/bills/${billNumber}`);
  return data;
}

// ---- Khata (customer credit / udhaar) ----
export async function getKhata() {
  const { data } = await http.get('/deopuri/medical/khata');
  return data;
}

export async function recordKhataPayment(payload) {
  const { data } = await http.post('/deopuri/medical/khata/pay', payload);
  return data;
}

// ---- Expenses ----
export async function getMedicalExpenses() {
  const { data } = await http.get('/deopuri/medical/expenses');
  return data;
}

export async function addMedicalExpense(payload) {
  const { data } = await http.post('/deopuri/medical/expenses', payload);
  return data;
}

export async function deleteMedicalExpense(id) {
  await http.delete(`/deopuri/medical/expenses/${id}`);
}

// ---- Profit & Loss ----
export async function getMedicalProfitLoss(from, to) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await http.get('/deopuri/medical/profit-loss', { params });
  return data;
}
