import { HOLD_REASON_OPTIONS, RETURN_REASON_OPTIONS, isOptionValue } from '@/data/shipmentOptions';
import type { ShipmentHandling, ShipmentStatus } from '@/types/logistics';

const OTHER_REASON = 'other';
const NOTES_MAX_LENGTH = 500;

export interface ShipmentHandlingForm {
  on_hold_reason: string;
  on_hold_notes: string;
  return_to_sender: boolean;
  return_reason: string;
  return_date: string;
  return_notes: string;
}

export type ShipmentHandlingErrors = Partial<Record<keyof ShipmentHandlingForm, string>>;

export function toShipmentHandlingForm(source: ShipmentHandling | null): ShipmentHandlingForm {
  return {
    on_hold_reason: source?.on_hold_reason ?? '',
    on_hold_notes: source?.on_hold_notes ?? '',
    return_to_sender: source?.return_to_sender ?? false,
    return_reason: source?.return_reason ?? '',
    return_date: source?.return_date ?? '',
    return_notes: source?.return_notes ?? '',
  };
}

export function validateShipmentHandling(form: ShipmentHandlingForm, status: ShipmentStatus): ShipmentHandlingErrors {
  const errors: ShipmentHandlingErrors = {};
  if (status === 'on_hold') {
    if (!isOptionValue(HOLD_REASON_OPTIONS, form.on_hold_reason)) errors.on_hold_reason = 'Please choose the hold reason.';
    else if (form.on_hold_reason === OTHER_REASON && form.on_hold_notes.trim() === '') errors.on_hold_notes = 'Please specify the hold reason.';
  }
  if (form.on_hold_notes.length > NOTES_MAX_LENGTH) errors.on_hold_notes = `Please keep this under ${NOTES_MAX_LENGTH} characters.`;

  if (form.return_to_sender) {
    if (!isOptionValue(RETURN_REASON_OPTIONS, form.return_reason)) errors.return_reason = 'Please choose the return reason.';
    else if (form.return_reason === OTHER_REASON && form.return_notes.trim() === '') errors.return_notes = 'Please specify the return reason.';
    if (!form.return_date) errors.return_date = 'Please enter the return date.';
  }
  if (form.return_notes.length > NOTES_MAX_LENGTH) errors.return_notes = `Please keep this under ${NOTES_MAX_LENGTH} characters.`;
  return errors;
}

export function toShipmentHandling(form: ShipmentHandlingForm, status: ShipmentStatus): ShipmentHandling {
  const orNull = (value: string) => (value.trim() === '' ? null : value.trim());
  const onHold = status === 'on_hold';
  return {
    on_hold_reason: onHold ? orNull(form.on_hold_reason) : null,
    on_hold_notes: onHold ? orNull(form.on_hold_notes) : null,
    return_to_sender: form.return_to_sender,
    return_reason: form.return_to_sender ? orNull(form.return_reason) : null,
    return_date: form.return_to_sender ? orNull(form.return_date) : null,
    return_notes: form.return_to_sender ? orNull(form.return_notes) : null,
  };
}
