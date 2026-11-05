import type { ShipmentSender } from '@/types/logistics';
import { isFilled, isInternationalPhone, isValidEmail } from '@/lib/validation';

export interface SenderForm {
  sender_name: string;
  sender_phone: string;
  sender_alt_phone: string;
  sender_email: string;
  sender_country: string;
  sender_state: string;
  sender_city: string;
  sender_district: string;
  sender_street: string;
  sender_building_number: string;
  sender_pickup_address: string;
  sender_landmark: string;
  sender_postal_code: string;
}

export type SenderErrors = Partial<Record<keyof SenderForm, string>>;

const PHONE_HINT = 'Start with the country code, for example +44 20 7946 0000.';

export function toSenderForm(source: ShipmentSender | null): SenderForm {
  return {
    sender_name: source?.sender_name ?? '',
    sender_phone: source?.sender_phone ?? '',
    sender_alt_phone: source?.sender_alt_phone ?? '',
    sender_email: source?.sender_email ?? '',
    sender_country: source?.sender_country ?? '',
    sender_state: source?.sender_state ?? '',
    sender_city: source?.sender_city ?? '',
    sender_district: source?.sender_district ?? '',
    sender_street: source?.sender_street ?? '',
    sender_building_number: source?.sender_building_number ?? '',
    sender_pickup_address: source?.sender_pickup_address ?? '',
    sender_landmark: source?.sender_landmark ?? '',
    sender_postal_code: source?.sender_postal_code ?? '',
  };
}

export function validateSender(form: SenderForm): SenderErrors {
  const errors: SenderErrors = {};
  if (!isFilled(form.sender_name, 2, 120)) errors.sender_name = 'Please enter the sender full name.';
  if (!isInternationalPhone(form.sender_phone)) errors.sender_phone = PHONE_HINT;
  if (form.sender_alt_phone.trim() && !isInternationalPhone(form.sender_alt_phone)) errors.sender_alt_phone = PHONE_HINT;
  if (!isValidEmail(form.sender_email.trim())) errors.sender_email = 'Please enter a valid email address.';
  if (!isFilled(form.sender_country, 2, 80)) errors.sender_country = 'Required.';
  if (!isFilled(form.sender_state, 2, 80)) errors.sender_state = 'Required.';
  if (!isFilled(form.sender_city, 2, 80)) errors.sender_city = 'Required.';
  if (!isFilled(form.sender_district, 2, 80)) errors.sender_district = 'Required.';
  if (!isFilled(form.sender_street, 2, 120)) errors.sender_street = 'Required.';
  if (!isFilled(form.sender_building_number, 1, 30)) errors.sender_building_number = 'Required.';
  if (!isFilled(form.sender_pickup_address, 5, 300)) errors.sender_pickup_address = 'Please enter the complete pickup address.';
  if (form.sender_landmark.length > 160) errors.sender_landmark = 'Please keep this under 160 characters.';
  if (form.sender_postal_code.length > 20) errors.sender_postal_code = 'Please keep this under 20 characters.';
  return errors;
}

export function toSenderFields(form: SenderForm): ShipmentSender {
  const orNull = (value: string) => (value.trim() === '' ? null : value.trim());
  return {
    sender_name: orNull(form.sender_name),
    sender_phone: orNull(form.sender_phone),
    sender_alt_phone: orNull(form.sender_alt_phone),
    sender_email: orNull(form.sender_email),
    sender_country: orNull(form.sender_country),
    sender_state: orNull(form.sender_state),
    sender_city: orNull(form.sender_city),
    sender_district: orNull(form.sender_district),
    sender_street: orNull(form.sender_street),
    sender_building_number: orNull(form.sender_building_number),
    sender_pickup_address: orNull(form.sender_pickup_address),
    sender_landmark: orNull(form.sender_landmark),
    sender_postal_code: orNull(form.sender_postal_code),
  };
}
