import { http } from "./http";

// Get All Expenses
export const getAllExpenses = async () => {
  const response = await http.get("/api/expenses");
  return response.data;
};

// Get Expense By Id
export const getExpenseById = async (id) => {
  const response = await http.get(`/api/expenses/${id}`);
  return response.data;
};

// Create Expense
export const createExpense = async (data) => {
  const response = await http.post("/api/expenses", data);
  return response.data;
};

// Update Expense
export const updateExpense = async (id, data) => {
  const response = await http.put(`/api/expenses/${id}`, data);
  return response.data;
};

// Delete Expense
export const deleteExpense = async (id) => {
  await http.delete(`/api/expenses/${id}`);
};