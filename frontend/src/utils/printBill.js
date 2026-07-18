// Opens a clean, self-contained invoice in a new window and triggers the browser's print
// dialog. Kept separate from the app's CSS so the printout is predictable.
import { getShopDetails } from './billTools.js';

const inr = (v) => '₹' + Number(v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function printBill(bill) {
  if (!bill) return;

  const rows = (bill.items || [])
    .map(
      (it, i) => `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${esc(it.productName)}</td>
          <td style="text-align:center">${it.quantity}</td>
          <td style="text-align:right">${inr(it.salePrice)}</td>
          <td style="text-align:right">${inr(it.lineTotal)}</td>
        </tr>`,
    )
    .join('');

  const date = bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '';

  const shop = getShopDetails();
  const gstRate = Number(shop.gstRate) || 0;
  // Prices are treated as GST-inclusive (Indian MRP style): reverse-derive the tax so the
  // total the customer pays never changes.
  const grand = Number(bill.totalAmount) || 0;
  const taxable = gstRate > 0 ? grand / (1 + gstRate / 100) : grand;
  const gstAmount = grand - taxable;

  const shopMetaLine = [
    shop.address ? esc(shop.address) : '',
    shop.phone ? '📞 ' + esc(shop.phone) : '',
  ].filter(Boolean).join(' · ');
  const shopIdsLine = [
    shop.gstin ? 'GSTIN: ' + esc(shop.gstin) : '',
    shop.license ? 'DL No: ' + esc(shop.license) : '',
  ].filter(Boolean).join(' &nbsp;|&nbsp; ');

  const gstRows = gstRate > 0
    ? `<tr><td colspan="4" style="text-align:right;font-weight:600">Taxable value</td><td style="text-align:right">${inr(taxable)}</td></tr>
       <tr><td colspan="4" style="text-align:right;font-weight:600">GST @ ${gstRate}% (incl.)</td><td style="text-align:right">${inr(gstAmount)}</td></tr>`
    : '';

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(bill.billNumber || 'Bill')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; }
  .wrap { max-width: 720px; margin: 0 auto; }
  .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #059669; padding-bottom:14px; }
  .shop { font-size: 22px; font-weight: 800; color:#047857; }
  .muted { color:#6b7280; font-size: 12px; }
  .title { text-align:right; }
  .title h1 { margin:0; font-size: 18px; letter-spacing:.05em; }
  .meta { display:flex; justify-content:space-between; gap:16px; margin:16px 0; font-size: 13px; }
  table { width:100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  th { background:#ecfdf5; color:#065f46; text-align:left; padding:8px; border-bottom:1px solid #a7f3d0; }
  td { padding:8px; border-bottom:1px solid #f0f0f0; }
  tfoot td { font-weight:800; border-top:2px solid #059669; font-size: 15px; }
  .thanks { margin-top: 22px; text-align:center; color:#6b7280; font-size: 12px; }
  @media print { body { padding: 0; } .noprint { display:none; } }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div>
        <div class="shop">🌿 ${esc(bill.sellerShopName || 'Deopuri Herbal')}</div>
        <div class="muted">Medical Store</div>
        ${shopMetaLine ? `<div class="muted">${shopMetaLine}</div>` : ''}
        ${shopIdsLine ? `<div class="muted">${shopIdsLine}</div>` : ''}
      </div>
      <div class="title">
        <h1>INVOICE</h1>
        <div class="muted">${esc(bill.billNumber || '')}</div>
        <div class="muted">${esc(date)}</div>
      </div>
    </div>

    <div class="meta">
      <div>
        <div class="muted">Billed to</div>
        <div><b>${esc(bill.customerName || 'Walk-in customer')}</b></div>
        ${bill.customerMobile ? `<div class="muted">📱 ${esc(bill.customerMobile)}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr><th style="text-align:center">#</th><th>Medicine</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        ${gstRows}
        <tr><td colspan="4" style="text-align:right">Grand Total</td><td style="text-align:right">${inr(bill.totalAmount)}</td></tr>
      </tfoot>
    </table>

    <div class="thanks">
      🙏 Thank you! Get well soon.
      <div style="margin-top:6px; font-weight:700; color:#047857;">— Powered by Deopuri Herbal 🌿</div>
    </div>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) {
    alert('Print window blocked — please allow pop-ups for this site.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
