import { FEE_AMOUNT_ERROR, FEE_CATEGORIES, parseFeeAmount, type FeeCategory } from '@/lib/payments';
import type { ShipmentFee } from '@/types/logistics';

export type FeeForm = Record<FeeCategory, string>;
export type FeeErrors = Partial<Record<FeeCategory, string>>;
export type FeeAmounts = Record<FeeCategory, number | null>;

export function emptyFeeForm(): FeeForm {
  return Object.fromEntries(FEE_CATEGORIES.map((category) => [category, ''])) as FeeForm;
}

export function toFeeForm(fees: ShipmentFee[]): FeeForm {
  const form = emptyFeeForm();
  for (const category of FEE_CATEGORIES) {
    const rows = fees.filter((fee) => fee.label === category);
    if (rows.length > 0) form[category] = rows.reduce((sum, fee) => sum + Number(fee.amount), 0).toFixed(2);
  }
  return form;
}

export function validateFeeForm(form: FeeForm): FeeErrors {
  const errors: FeeErrors = {};
  for (const category of FEE_CATEGORIES) {
    if (form[category].trim() !== '' && parseFeeAmount(form[category]) === null) errors[category] = FEE_AMOUNT_ERROR;
  }
  return errors;
}

export function toFeeAmounts(form: FeeForm): FeeAmounts {
  return Object.fromEntries(
    FEE_CATEGORIES.map((category) => [category, form[category].trim() === '' ? null : parseFeeAmount(form[category])]),
  ) as FeeAmounts;
}

export function sumFeeAmounts(amounts: FeeAmounts): number {
  return Math.round(Object.values(amounts).reduce<number>((sum, value) => sum + (value ?? 0), 0) * 100) / 100;
}
