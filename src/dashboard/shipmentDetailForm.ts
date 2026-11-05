import { OTHER_CONTENTS_MAX_LENGTH, parseContents } from '@/data/shipmentContents';
import type { ShipmentDetails } from '@/types/logistics';

export interface ShipmentDetailForm {
  transport_method: string;
  shipment_category: string;
  shipment_contents: string;
  animal_type: string;
  animal_count: string;
  collection_location: string;
  special_handling: string;
  veterinary_documentation: string;
}

export type ShipmentDetailErrors = Partial<Record<keyof ShipmentDetailForm, string>>;

export function toShipmentDetailForm(source: ShipmentDetails | null): ShipmentDetailForm {
  return {
    transport_method: source?.transport_method ?? '',
    shipment_category: source?.shipment_category ?? '',
    shipment_contents: source?.shipment_contents ?? '',
    animal_type: source?.animal_type ?? '',
    animal_count: source?.animal_count?.toString() ?? '',
    collection_location: source?.collection_location ?? '',
    special_handling: source?.special_handling ?? '',
    veterinary_documentation: source?.veterinary_documentation ?? '',
  };
}

export function validateShipmentDetails(form: ShipmentDetailForm): ShipmentDetailErrors {
  const errors: ShipmentDetailErrors = {};
  const count = form.animal_count.trim();
  if (count && !/^\d+$/.test(count)) errors.animal_count = 'Please enter a whole number.';
  else if (count && (Number(count) < 1 || Number(count) > 999)) errors.animal_count = 'Enter a number between 1 and 999.';
  if (form.collection_location.length > 160) errors.collection_location = 'Please keep this under 160 characters.';
  const contents = parseContents(form.shipment_contents);
  if (contents.other === '') errors.shipment_contents = 'Please describe the other contents.';
  else if (contents.other && contents.other.length > OTHER_CONTENTS_MAX_LENGTH) errors.shipment_contents = `Please keep the other contents under ${OTHER_CONTENTS_MAX_LENGTH} characters.`;
  return errors;
}

export function toShipmentDetails(form: ShipmentDetailForm): ShipmentDetails {
  const orNull = (value: string) => (value.trim() === '' ? null : value.trim());
  return {
    transport_method: orNull(form.transport_method),
    shipment_category: orNull(form.shipment_category),
    shipment_contents: orNull(form.shipment_contents),
    animal_type: orNull(form.animal_type),
    animal_count: form.animal_count.trim() === '' ? null : Number(form.animal_count),
    collection_location: orNull(form.collection_location),
    special_handling: orNull(form.special_handling),
    veterinary_documentation: orNull(form.veterinary_documentation),
  };
}
