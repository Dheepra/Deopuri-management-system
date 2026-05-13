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
  const { data } = await http.get('/api/products', { signal });
  return data;
}
