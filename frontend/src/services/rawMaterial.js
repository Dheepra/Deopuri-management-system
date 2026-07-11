import { http } from "./http";

// Get All
export const getAllRawMaterials = async () => {
  const response = await http.get("/api/raw-material");
  return response.data;
};

// Get By Id
export const getRawMaterialById = async (id) => {
  const response = await http.get(`/api/raw-material/${id}`);
  return response.data;
};

// Create
export const createRawMaterial = async (data) => {
  const response = await http.post("/api/raw-material", data);
  return response.data;
};

// Update
export const updateRawMaterial = async (id, data) => {
  const response = await http.put(`/api/raw-material/${id}`, data);
  return response.data;
};

// Delete
export const deleteRawMaterial = async (id) => {
  await http.delete(`/api/raw-material/${id}`);
};