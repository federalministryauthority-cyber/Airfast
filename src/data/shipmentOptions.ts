export interface ShipmentOption {
  value: string;
  label: string;
}

export const TRANSPORT_METHOD_OPTIONS: readonly ShipmentOption[] = [
  { value: 'road', label: 'Road transport' },
  { value: 'air', label: 'Air freight' },
  { value: 'sea', label: 'Sea freight' },
  { value: 'rail', label: 'Rail freight' },
  { value: 'multimodal', label: 'Multimodal transport' },
];

export const SHIPMENT_CATEGORY_OPTIONS: readonly ShipmentOption[] = [
  { value: 'general_merchandise', label: 'General merchandise' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing_textiles', label: 'Clothing and textiles' },
  { value: 'food_products', label: 'Food products' },
  { value: 'machinery_equipment', label: 'Machinery and equipment' },
  { value: 'documents', label: 'Documents' },
  { value: 'medical_supplies', label: 'Medical supplies' },
  { value: 'agricultural_products', label: 'Agricultural products' },
  { value: 'automotive_parts', label: 'Automotive parts' },
  { value: 'furniture_household', label: 'Furniture and household goods' },
  { value: 'cosmetics_beauty', label: 'Cosmetics and beauty products' },
  { value: 'pet_supplies', label: 'Pet supplies' },
  { value: 'perishable_goods', label: 'Perishable goods' },
  { value: 'fragile_goods', label: 'Fragile goods' },
  { value: 'industrial_materials', label: 'Industrial materials' },
  { value: 'construction_materials', label: 'Construction materials' },
  { value: 'sports_equipment', label: 'Sports equipment' },
  { value: 'personal_effects', label: 'Personal effects' },
  { value: 'other_goods', label: 'Other goods' },
];

export const ANIMAL_TYPE_OPTIONS: readonly ShipmentOption[] = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'horse', label: 'Horse' },
  { value: 'bird', label: 'Bird' },
  { value: 'small_mammal', label: 'Small mammal' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'other', label: 'Other animal' },
];

export const SPECIAL_HANDLING_OPTIONS: readonly ShipmentOption[] = [
  { value: 'none', label: 'No special handling' },
  { value: 'fragile_goods', label: 'Fragile goods' },
  { value: 'other', label: 'Other' },
];

export const VETERINARY_DOCUMENT_OPTIONS: readonly ShipmentOption[] = [
  { value: 'not_required', label: 'Not required' },
  { value: 'provided', label: 'Provided' },
  { value: 'pending', label: 'Pending' },
];

export const HOLD_REASON_OPTIONS: readonly ShipmentOption[] = [
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'missing_documents', label: 'Missing Documents' },
  { value: 'customs_issues', label: 'Customs Issues' },
  { value: 'incorrect_address', label: 'Incorrect Address' },
  { value: 'recipient_unavailable', label: 'Recipient Unavailable' },
  { value: 'sender_request', label: 'Sender Request' },
  { value: 'animal_health_documentation', label: 'Animal / Health Documentation' },
  { value: 'security_inspection', label: 'Security Inspection' },
  { value: 'other', label: 'Other (Please Specify)' },
];

export const RETURN_REASON_OPTIONS: readonly ShipmentOption[] = [
  { value: 'recipient_refused', label: 'Recipient Refused Delivery' },
  { value: 'incorrect_address', label: 'Incorrect or Incomplete Address' },
  { value: 'recipient_unavailable', label: 'Recipient Unavailable' },
  { value: 'customs_rejection', label: 'Customs Rejection' },
  { value: 'unpaid_fees', label: 'Unpaid Shipment Fees' },
  { value: 'sender_requested_return', label: 'Sender Requested Return' },
  { value: 'other', label: 'Other (Please Specify)' },
];

export function findOptionLabel(options: readonly ShipmentOption[], value: string | null | undefined): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? null;
}

export function isOptionValue(options: readonly ShipmentOption[], value: string): boolean {
  return options.some((option) => option.value === value);
}
