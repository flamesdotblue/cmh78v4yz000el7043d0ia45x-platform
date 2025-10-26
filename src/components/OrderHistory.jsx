import { useMemo, useState } from 'react';

function formatCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}

export default function OrderHistory({ orders, onNewOrder }) {
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = query.trim().toLowerCase();
      const okQ = !q || o.customerName.toLowerCase().includes(q) || o.items.some((i) => i.name.toLowerCase().includes(q));
      const okD = !date || o.createdAt.slice(0, 10) === date;
      return okQ && okD;
    });
  }, [orders, query, date]);

  return (
    <div className="rounded-2xl bg-white ring-1 ring-rose-200/60 p-5">
      <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        <div>
          <h2 className="text-lg font-semibold text-rose-800">Order History</h2>
          <p className="text-sm text-rose-600/80">Search by customer name or item.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders"
            className="rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-rose-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <button
            onClick={() => { setQuery(''); setDate(''); }}
            className="rounded-md bg-slate-200 text-slate-700 px-3 py-2"
          >
            Clear
          </button>
          <button
            onClick={onNewOrder}
            className="rounded-md bg-rose-600 text-white px-3 py-2"
          >
            New Order
          </button>
        </div>
      </div>

      <div className="mt-4 divide-y divide-rose-100">
        {filtered.length === 0 && (
          <div className="text-sm text-rose-600/80 py-8 text-center">No matching orders.</div>
        )}
        {filtered.map((o) => (
          <details key={o.id} className="py-3 group">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <div>
                <div className="font-medium text-rose-900">{o.customerName} • {new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-xs text-rose-500">{o.items.length} items • {o.paymentMethod} • {o.status}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-rose-800">{formatCurrency(o.total)}</div>
                <div className="text-xs text-rose-500">Subtotal {formatCurrency(o.subtotal)} • Tax {formatCurrency(o.tax)}</div>
              </div>
            </summary>
            <div className="mt-3 pl-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {o.items.map((it, idx) => (
                  <div key={idx} className="rounded-lg bg-rose-50 p-3 flex items-start justify-between">
                    <div>
                      <div className="font-medium text-rose-900">{it.name} × {it.qty}</div>
                      {it.note && <div className="text-xs text-rose-500">Note: {it.note}</div>}
                      <div className="text-xs text-rose-500">{formatCurrency(it.price)} each</div>
                    </div>
                    <div className="font-semibold text-rose-800">{formatCurrency(it.price * it.qty)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => printReceipt(o)}
                  className="rounded-md bg-rose-600 text-white px-3 py-2"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function printReceipt(order) {
  const win = window.open('', '_blank');
  if (!win) return;
  const styles = `
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif; padding: 16px; }
      h1 { font-size: 18px; margin: 0 0 8px; }
      .muted { color: #6b7280; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
      tfoot td { font-weight: 700; }
    </style>
  `;
  const rows = order.items
    .map(
      (i) => `<tr><td>${escapeHtml(i.name)}${i.note ? ` <span class="muted">(${escapeHtml(i.note)})</span>` : ''}</td><td>x${i.qty}</td><td style="text-align:right">$${(i.price * i.qty).toFixed(2)}</td></tr>`
    )
    .join('');
  win.document.write(`
    ${styles}
    <h1>Cafe Receipt</h1>
    <div class="muted">${new Date(order.createdAt).toLocaleString()}</div>
    <div class="muted">Customer: ${escapeHtml(order.customerName)}</div>
    <div class="muted">Payment: ${escapeHtml(order.paymentMethod)}</div>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="2">Subtotal</td><td style="text-align:right">$${order.subtotal.toFixed(2)}</td></tr>
        <tr><td colspan="2">Tax</td><td style="text-align:right">$${order.tax.toFixed(2)}</td></tr>
        <tr><td colspan="2">Total</td><td style="text-align:right">$${order.total.toFixed(2)}</td></tr>
      </tfoot>
    </table>
  `);
  win.document.close();
  win.focus();
  win.print();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
