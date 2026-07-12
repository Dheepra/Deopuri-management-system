// Tiny client-side CSV export. Converts an array of rows into a CSV file and triggers a download —
// no backend needed for data already loaded on the page.
//
// columns: [{ header: 'Order #', value: (row) => row.orderNumber }]
// If a column has no `value`, `row[key]` is used.

function escapeCell(value) {
  if (value == null) return '';
  const s = String(value);
  // Quote if it contains comma, quote, or newline; double up embedded quotes.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function rowsToCsv(rows, columns) {
  const header = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => escapeCell(c.value ? c.value(row) : row[c.key]))
        .join(','),
    )
    .join('\n');
  return `${header}\n${body}`;
}

export function downloadCsv(filename, rows, columns) {
  const csv = rowsToCsv(rows ?? [], columns);
  // Prepend BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Today's date as YYYY-MM-DD, handy for filenames.
export function todayStamp() {
  return new Date().toLocaleDateString('en-CA');
}
