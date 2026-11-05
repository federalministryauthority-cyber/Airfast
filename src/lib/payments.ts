import type { PaymentMethod, ShipmentFee, ShipmentPayment } from '@/types/logistics';

export const CURRENCY = 'EUR';

export const FEE_CATEGORIES = [
  'Flight / Air Freight Fee',
  'Delivery Fee',
  'Pickup Fee',
  'Customs / Handling Fee',
  'Other Charges',
] as const;
export type FeeCategory = (typeof FEE_CATEGORIES)[number];

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const AMOUNT_MAX = 1000000;
export const FEE_AMOUNT_ERROR = 'Enter an amount of 0 or more with up to two decimal places.';

export function parseFeeAmount(text: string): number | null {
  const trimmed = text.trim();
  if (!AMOUNT_PATTERN.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return parsed <= AMOUNT_MAX ? parsed : null;
}

export const PAYMENT_STATUSES = ['unpaid', 'processing', 'partially_paid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  processing: 'Processing',
  partially_paid: 'Partially Paid',
  paid: 'Paid',
  refunded: 'Refunded',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  paypal: 'PayPal',
  cash: 'Cash',
  other: 'Other',
};

export function paymentMethodName(entry: Pick<ShipmentPayment, 'method' | 'method_other'>): string {
  if (entry.method === 'other') return entry.method_other || PAYMENT_METHOD_LABELS.other;
  return PAYMENT_METHOD_LABELS[entry.method];
}

export interface PaymentSummary {
  total: number;
  paid: number;
  refunded: number;
  net: number;
  outstanding: number;
  pendingVerification: number;
  status: PaymentStatus;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculatePaymentSummary(fees: ShipmentFee[], payments: ShipmentPayment[]): PaymentSummary {
  const total = roundMoney(fees.reduce((sum, fee) => sum + Number(fee.amount), 0));
  const verified = payments.filter((entry) => entry.verified);
  const paid = roundMoney(verified.filter((entry) => entry.entry_type === 'payment').reduce((sum, entry) => sum + Number(entry.amount), 0));
  const refunded = roundMoney(verified.filter((entry) => entry.entry_type === 'refund').reduce((sum, entry) => sum + Number(entry.amount), 0));
  const pendingVerification = roundMoney(
    payments.filter((entry) => !entry.verified && entry.entry_type === 'payment').reduce((sum, entry) => sum + Number(entry.amount), 0),
  );
  const net = roundMoney(paid - refunded);
  const outstanding = roundMoney(total - net);

  let status: PaymentStatus = 'unpaid';
  if (refunded > 0 && net <= 0) status = 'refunded';
  else if (total > 0 && net >= total) status = 'paid';
  else if (net > 0) status = 'partially_paid';
  else if (pendingVerification > 0) status = 'processing';

  return { total, paid, refunded, net, outstanding, pendingVerification, status };
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: CURRENCY }).format(value);
}
