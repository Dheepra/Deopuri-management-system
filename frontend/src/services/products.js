import { http } from './http.js';
import { featuredImages } from '../assets/picture';

const FALLBACK_FEATURED = [
  { id: 'paracetamol-500', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 39, badge: 'Bestseller' },
  { id: 'cough-syrup-100', name: 'Daily Cough Syrup', category: 'Respiratory', price: 145, badge: 'New' },
  { id: 'vit-d3-60', name: 'Vitamin D3 60K IU', category: 'Supplements', price: 220 },
  { id: 'thermometer-digital', name: 'Digital Thermometer', category: 'Equipment', price: 349 },
  { id: 'glucometer-strips', name: 'Glucometer Strips (50)', category: 'Diabetes Care', price: 599, badge: 'Stocked' },
  { id: 'first-aid-kit', name: 'Family First Aid Kit', category: 'Essentials', price: 899 },
];

export function getFeaturedProducts() {
  return FALLBACK_FEATURED.map((product, index) => ({
    ...product,
    image: featuredImages[index % featuredImages.length],
  }));
}

  export async function fetchProducts({ signal } = {}) {
    const { data } = await http.get('/deopuri/products', { signal });
    return data;
  }


  export const createProduct = (formData) =>
  http.post("/deopuri/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  
export const updateProduct = (id, formData) =>
  http.put(`/deopuri/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

export async function deleteProduct(id) {
  const { data } = await http.delete(`/deopuri/products/${id}`);
  return data;
}

export async function importProducts(file) {
  const form = new FormData();
  form.append('file', file);

  // Let the browser set the multipart boundary — do NOT set Content-Type manually.
  const { data } = await http.post('/deopuri/products/import', form);
  return data;
}

export async function addVariant(productId, payload) {
  const { data } = await http.post(
    `/deopuri/products/${productId}/variants`,
    payload
  );

  return data;
}