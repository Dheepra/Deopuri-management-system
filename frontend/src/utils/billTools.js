// Shared helpers for bills: shop details (GSTIN / license, stored locally per browser)
// and WhatsApp sharing. Kept in one place so the print view, the billing page and any
// future screen render invoices consistently.

const SHOP_KEY = 'medical.shopDetails';

// { gstin, license, address, phone, gstRate }
export function getShopDetails() {
  try {
    return JSON.parse(localStorage.getItem(SHOP_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveShopDetails(details) {
  localStorage.setItem(SHOP_KEY, JSON.stringify(details || {}));
}

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Opens WhatsApp with a ready-to-send bill summary. If the customer's mobile is on the
// bill it pre-selects the chat (assumes India +91 for a bare 10-digit number).
export function whatsappBill(bill) {
  if (!bill) return;
  const shop = getShopDetails();
  const lines = (bill.items || [])
    .map((it) => `• ${it.productName} x${it.quantity} = ${inr(it.lineTotal)}`)
    .join('\n');
  const text =
    `*${bill.sellerShopName || 'Deopuri Herbal'}*\n` +
    `Bill: ${bill.billNumber}\n` +
    `${bill.customerName ? 'Customer: ' + bill.customerName + '\n' : ''}` +
    `\n${lines}\n\n` +
    `*Total: ${inr(bill.totalAmount)}*\n\n` +
    `Thank you! 🙏 Get well soon.\n` +
    `${shop.phone ? '📞 ' + shop.phone + '\n' : ''}` +
    `— Powered by Deopuri Herbal 🌿`;

  const digits = String(bill.customerMobile || '').replace(/\D/g, '');
  const num = digits.length === 10 ? '91' + digits : digits;
  const base = num ? `https://wa.me/${num}` : 'https://wa.me/';
  window.open(`${base}?text=${encodeURIComponent(text)}`, '_blank');
}

// Generic WhatsApp opener (used for khata/payment reminders).
export function whatsappText(mobile, text) {
  const digits = String(mobile || '').replace(/\D/g, '');
  const num = digits.length === 10 ? '91' + digits : digits;
  const base = num ? `https://wa.me/${num}` : 'https://wa.me/';
  window.open(`${base}?text=${encodeURIComponent(text)}`, '_blank');
}
