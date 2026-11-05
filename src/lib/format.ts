import type { ShipmentStatus } from '@/types/logistics';

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  received: 'Shipment Received',
  processing: 'Processing',
  in_transit: 'In Transit',
  arrived: 'Arrived at Destination',
  customs: 'Customs Clearance',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delayed: 'Delayed',
  on_hold: 'On Hold',
};

export function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : '';
}
