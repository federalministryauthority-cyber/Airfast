import { calculatePaymentSummary, formatMoney, PAYMENT_STATUS_LABELS, paymentMethodName } from '@/lib/payments';
import { formatDate, formatDateTime } from '@/lib/format';
import type { ShipmentFee, ShipmentPayment, ShipmentRecord } from '@/types/logistics';

interface PaymentDocumentInput {
  kind: 'invoice' | 'receipt';
  shipment: ShipmentRecord;
  fees: ShipmentFee[];
  payments: ShipmentPayment[];
  payment?: ShipmentPayment;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function row(label: string, value: string): string {
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
}

function header(title: string, number: string, issued: string, logoUrl: string): string {
  return `
    <header class="top">
      <img src="${logoUrl}" alt="Airfast Logistics" class="logo" />
      <div class="meta">
        <h1>${escapeHtml(title)}</h1>
        <p>No. ${escapeHtml(number)}</p>
        <p>Issued ${escapeHtml(issued)}</p>
      </div>
    </header>`;
}

function invoiceBody(input: PaymentDocumentInput, logoUrl: string): string {
  const { shipment, fees, payments } = input;
  const summary = calculatePaymentSummary(fees, payments);
  const verified = payments.filter((entry) => entry.verified);
  const feeRows = fees
    .map((fee) => `<tr><td>${escapeHtml(fee.label)}</td><td class="num">${formatMoney(Number(fee.amount))}</td></tr>`)
    .join('');
  const entryRows = verified
    .map(
      (entry) => `<tr>
        <td>${formatDate(entry.payment_date)}</td>
        <td>${entry.entry_type === 'refund' ? 'Refund' : 'Payment'} · ${escapeHtml(paymentMethodName(entry))}</td>
        <td>${escapeHtml(entry.transaction_reference ?? '-')}</td>
        <td class="num">${entry.entry_type === 'refund' ? '-' : ''}${formatMoney(Number(entry.amount))}</td>
      </tr>`,
    )
    .join('');

  return `
    ${header('Invoice', shipment.tracking_number, formatDate(new Date().toISOString()), logoUrl)}
    <section class="parties">
      <div>
        <h2>Bill to</h2>
        <p>${escapeHtml(shipment.customer_name)}</p>
        ${shipment.customer_email ? `<p>${escapeHtml(shipment.customer_email)}</p>` : ''}
      </div>
      <div>
        <h2>Shipment</h2>
        <p>${escapeHtml(shipment.origin_city)}, ${escapeHtml(shipment.origin_country)} to ${escapeHtml(shipment.destination_city)}, ${escapeHtml(shipment.destination_country)}</p>
        <p>Status: ${escapeHtml(PAYMENT_STATUS_LABELS[summary.status])}</p>
      </div>
    </section>
    <h2>Charges</h2>
    <table class="items">
      <thead><tr><th>Description</th><th class="num">Amount</th></tr></thead>
      <tbody>${feeRows || '<tr><td colspan="2">No fees recorded.</td></tr>'}</tbody>
    </table>
    <h2>Payments and refunds (verified)</h2>
    <table class="items">
      <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th class="num">Amount</th></tr></thead>
      <tbody>${entryRows || '<tr><td colspan="4">No verified payments yet.</td></tr>'}</tbody>
    </table>
    <table class="totals">
      ${row('Total Shipment Cost', formatMoney(summary.total))}
      ${row('Amount Paid', formatMoney(summary.net))}
      <tr class="due"><th>Outstanding Balance</th><td>${formatMoney(summary.outstanding)}</td></tr>
    </table>
    ${summary.pendingVerification > 0 ? `<p class="note">${formatMoney(summary.pendingVerification)} is awaiting verification and is not included above.</p>` : ''}`;
}

function receiptBody(input: PaymentDocumentInput, logoUrl: string): string {
  const { shipment, payment } = input;
  if (!payment) return '';
  const isRefund = payment.entry_type === 'refund';
  return `
    ${header(isRefund ? 'Refund Receipt' : 'Payment Receipt', payment.receipt_number ?? shipment.tracking_number, formatDateTime(payment.verified_at), logoUrl)}
    <table class="totals">
      ${row('Tracking number', shipment.tracking_number)}
      ${row('Customer', shipment.customer_name)}
      ${row('Payment date', formatDate(payment.payment_date))}
      ${row('Method', paymentMethodName(payment))}
      ${row('Transaction reference', payment.transaction_reference ?? '-')}
      ${row('Verified by', payment.verified_by_email ?? 'Administrator')}
      <tr class="due"><th>${isRefund ? 'Amount refunded' : 'Amount received'}</th><td>${isRefund ? '-' : ''}${formatMoney(Number(payment.amount))}</td></tr>
    </table>
    <p class="note">This receipt confirms the payment above was verified by Airfast Logistics.</p>`;
}

function documentHtml(input: PaymentDocumentInput, logoUrl: string): string {
  const title = input.kind === 'invoice' ? `Invoice ${input.shipment.tracking_number}` : `Receipt ${input.payment?.receipt_number ?? input.shipment.tracking_number}`;
  const body = input.kind === 'invoice' ? invoiceBody(input, logoUrl) : receiptBody(input, logoUrl);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; font-family: Arial, Helvetica, sans-serif; color: #1b2433; font-size: 13px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c9a227; padding-bottom: 20px; }
  .logo { height: 56px; object-fit: contain; }
  .meta { text-align: right; }
  .meta h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; color: #0b1b33; }
  .meta p { margin: 4px 0 0; color: #555; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #0b1b33; margin: 28px 0 10px; }
  .parties { display: flex; justify-content: space-between; gap: 32px; margin-top: 24px; }
  .parties div { flex: 1; }
  .parties p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; }
  .items th, .items td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e3e6ec; }
  .items th { background: #f3f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-top: 24px; width: 60%; margin-left: auto; }
  .totals th, .totals td { text-align: left; padding: 8px; border-bottom: 1px solid #e3e6ec; }
  .totals td { text-align: right; }
  .totals .due th, .totals .due td { font-weight: bold; font-size: 15px; color: #0b1b33; border-top: 2px solid #0b1b33; }
  .note { margin-top: 24px; color: #555; font-size: 12px; }
  footer { margin-top: 48px; padding-top: 14px; border-top: 1px solid #e3e6ec; color: #777; font-size: 11px; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
${body}
<footer>Airfast Logistics · Thank you for choosing Airfast</footer>
</body>
</html>`;
}

export function openPaymentDocument(input: PaymentDocumentInput): boolean {
  const documentWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!documentWindow) return false;
  const logoUrl = `${window.location.origin}/brand/airfast-logo.png`;
  documentWindow.document.open();
  documentWindow.document.write(documentHtml(input, logoUrl));
  documentWindow.document.close();
  documentWindow.focus();
  setTimeout(() => documentWindow.print(), 400);
  return true;
}
