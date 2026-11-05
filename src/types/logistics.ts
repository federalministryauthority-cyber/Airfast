export const SHIPMENT_STATUSES = [
  'received',
  'processing',
  'in_transit',
  'arrived',
  'customs',
  'out_for_delivery',
  'delivered',
  'delayed',
  'on_hold',
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPPING_METHODS = [
  { value: 'air', label: 'Air Freight' },
  { value: 'road', label: 'Road Transport' },
  { value: 'sea', label: 'Sea Freight' },
  { value: 'rail', label: 'Rail Freight' },
  { value: 'multimodal', label: 'Multimodal Transport' },
  { value: 'express', label: 'Express Transport' },
] as const;

export type ShippingMethod = (typeof SHIPPING_METHODS)[number]['value'];

export const QUOTE_STATUSES = ['new', 'in_progress', 'quoted', 'closed'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface ShipmentHandling {
  on_hold_reason: string | null;
  on_hold_notes: string | null;
  return_to_sender: boolean;
  return_reason: string | null;
  return_date: string | null;
  return_notes: string | null;
}

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value'];

export const SHIPMENT_PAYMENT_STATUSES = ['unpaid', 'partially_paid', 'paid', 'refunded'] as const;
export type ShipmentPaymentStatus = (typeof SHIPMENT_PAYMENT_STATUSES)[number];
export type PaymentEntryType = 'payment' | 'refund';

export interface ShipmentFee {
  id: string;
  shipment_id: string;
  label: string;
  amount: number;
  created_at: string;
}

export interface ShipmentPayment {
  id: string;
  shipment_id: string;
  entry_type: PaymentEntryType;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  method_other: string | null;
  transaction_reference: string | null;
  receipt_number: string | null;
  verified: boolean;
  verified_at: string | null;
  verified_by_email: string | null;
  recorded_by_email: string | null;
  created_at: string;
}

export interface TrackingEvent {
  event_time: string;
  status: ShipmentStatus;
  location: string;
  description: string;
}

export interface ShipmentDetails {
  transport_method: string | null;
  shipment_category: string | null;
  shipment_contents: string | null;
  animal_type: string | null;
  animal_count: number | null;
  collection_location: string | null;
  special_handling: string | null;
  veterinary_documentation: string | null;
}

export interface TrackedShipment extends ShipmentDetails, ShipmentHandling {
  tracking_number: string;
  status: ShipmentStatus;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  current_location: string;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  events: TrackingEvent[];
}

export interface ShipmentSender {
  sender_name: string | null;
  sender_phone: string | null;
  sender_alt_phone: string | null;
  sender_email: string | null;
  sender_country: string | null;
  sender_state: string | null;
  sender_city: string | null;
  sender_district: string | null;
  sender_street: string | null;
  sender_building_number: string | null;
  sender_pickup_address: string | null;
  sender_landmark: string | null;
  sender_postal_code: string | null;
}

export interface ShipmentRecipient {
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_alt_phone: string | null;
  recipient_email: string | null;
  recipient_state: string | null;
  recipient_district: string | null;
  recipient_street: string | null;
  recipient_building_number: string | null;
  recipient_delivery_address: string | null;
  recipient_landmark: string | null;
  recipient_postal_code: string | null;
}

export interface ShipmentRecord extends ShipmentDetails, ShipmentHandling, ShipmentSender, ShipmentRecipient {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  customer_name: string;
  customer_email: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  current_location: string;
  estimated_delivery: string | null;
  registered_date: string | null;
  payment_method: PaymentMethod | null;
  payment_method_other: string | null;
  payment_status: ShipmentPaymentStatus | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEventRecord {
  id: string;
  shipment_id: string;
  event_time: string;
  status: ShipmentStatus;
  location: string;
  description: string;
}

export interface QuoteRequestRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  collection_country: string;
  collection_city: string;
  destination_country: string;
  destination_city: string;
  shipment_type: string;
  parcel_contents: string | null;
  package_weight: string;
  package_dimensions: string;
  shipping_method: ShippingMethod;
  additional_info: string;
  status: QuoteStatus;
  admin_response: string;
  created_at: string;
}

export interface ContactMessageRecord {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ReviewRecord {
  id: string;
  customer_name: string;
  customer_country: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: string;
}
