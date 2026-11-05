import type { ShipmentRecipient, ShipmentRecord } from '@/types/logistics';
import { isFilled, isInternationalPhone, isValidEmail } from '@/lib/validation';

export interface RecipientForm {
  recipient_name: string;
  recipient_phone: string;
  recipient_alt_phone: string;
  recipient_email: string;
  destination_country: string;
  destination_city: string;
  recipient_state: string;
  recipient_district: string;
  recipient_street: string;
  recipient_building_number: string;
  recipient_delivery_address: string;
  recipient_landmark: string;
  recipient_postal_code: string;
}

export type RecipientErrors = Partial<Record<keyof RecipientForm, string>>;

const PHONE_HINT = 'Start with the country code, for example +44 20 7946 0000.';

export function toRecipientForm(source: ShipmentRecord | null): RecipientForm {
  return {
    recipient_name: source?.recipient_name ?? '',
    recipient_phone: source?.recipient_phone ?? '',
    recipient_alt_phone: source?.recipient_alt_phone ?? '',
    recipient_email: source?.recipient_email ?? '',
    destination_country: source?.destination_country ?? '',
    destination_city: source?.destination_city ?? '',
    recipient_state: source?.recipient_state ?? '',
    recipient_district: source?.recipient_district ?? '',
    recipient_street: source?.recipient_street ?? '',
    recipient_building_number: source?.recipient_building_number ?? '',
    recipient_delivery_address: source?.recipient_delivery_address ?? '',
    recipient_landmark: source?.recipient_landmark ?? '',
    recipient_postal_code: source?.recipient_postal_code ?? '',
  };
}

export function validateRecipient(form: RecipientForm): RecipientErrors {
  const errors: RecipientErrors = {};
  if (!isFilled(form.recipient_name, 2, 120)) errors.recipient_name = 'Please enter the recipient full name.';
  if (!isInternationalPhone(form.recipient_phone)) errors.recipient_phone = PHONE_HINT;
  if (form.recipient_alt_phone.trim() && !isInternationalPhone(form.recipient_alt_phone)) errors.recipient_alt_phone = PHONE_HINT;
  if (!isValidEmail(form.recipient_email.trim())) errors.recipient_email = 'Please enter a valid email address.';
  if (!isFilled(form.destination_country, 2, 80)) errors.destination_country = 'Required.';
  if (!isFilled(form.destination_city, 2, 80)) errors.destination_city = 'Required.';
  if (!isFilled(form.recipient_state, 2, 80)) errors.recipient_state = 'Required.';
  if (!isFilled(form.recipient_district, 2, 80)) errors.recipient_district = 'Required.';
  if (!isFilled(form.recipient_street, 2, 120)) errors.recipient_street = 'Required.';
  if (!isFilled(form.recipient_building_number, 1, 30)) errors.recipient_building_number = 'Required.';
  if (!isFilled(form.recipient_delivery_address, 5, 300)) errors.recipient_delivery_address = 'Please enter the complete delivery address.';
  if (form.recipient_landmark.length > 160) errors.recipient_landmark = 'Please keep this under 160 characters.';
  if (form.recipient_postal_code.length > 20) errors.recipient_postal_code = 'Please keep this under 20 characters.';
  return errors;
}

export function toRecipientFields(form: RecipientForm): ShipmentRecipient & { destination_country: string; destination_city: string } {
  const orNull = (value: string) => (value.trim() === '' ? null : value.trim());
  return {
    recipient_name: orNull(form.recipient_name),
    recipient_phone: orNull(form.recipient_phone),
    recipient_alt_phone: orNull(form.recipient_alt_phone),
    recipient_email: orNull(form.recipient_email),
    destination_country: form.destination_country.trim(),
    destination_city: form.destination_city.trim(),
    recipient_state: orNull(form.recipient_state),
    recipient_district: orNull(form.recipient_district),
    recipient_street: orNull(form.recipient_street),
    recipient_building_number: orNull(form.recipient_building_number),
    recipient_delivery_address: orNull(form.recipient_delivery_address),
    recipient_landmark: orNull(form.recipient_landmark),
    recipient_postal_code: orNull(form.recipient_postal_code),
  };
}
