import { supabase } from '@/lib/supabase';
import { FEE_CATEGORIES, type FeeCategory } from '@/lib/payments';
import type { PaymentEntryType, PaymentMethod, ShipmentFee, ShipmentPayment } from '@/types/logistics';

const LOAD_ERROR = 'Payment details could not be loaded. Please refresh and try again.';
const SAVE_ERROR = 'The payment change could not be saved. Please try again.';

export interface FeeInput {
  shipment_id: string;
  label: string;
  amount: number;
}

export interface PaymentInput {
  shipment_id: string;
  entry_type: PaymentEntryType;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  method_other: string | null;
  transaction_reference: string | null;
  receipt_number: string | null;
}

export async function fetchAllFees(): Promise<ShipmentFee[]> {
  const { data, error } = await supabase.from('shipment_fees').select('*').order('created_at', { ascending: true });
  if (error) throw new Error(LOAD_ERROR);
  return (data ?? []) as ShipmentFee[];
}

export async function fetchAllPayments(): Promise<ShipmentPayment[]> {
  const { data, error } = await supabase
    .from('shipment_payments')
    .select('*')
    .order('payment_date', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(LOAD_ERROR);
  return (data ?? []) as ShipmentPayment[];
}

export async function addFee(input: FeeInput): Promise<void> {
  const { error } = await supabase.from('shipment_fees').insert(input);
  if (error) throw new Error(SAVE_ERROR);
}

export async function deleteFee(id: string): Promise<void> {
  const { error } = await supabase.from('shipment_fees').delete().eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function updateFee(id: string, input: Pick<FeeInput, 'label' | 'amount'>): Promise<void> {
  const { error } = await supabase.from('shipment_fees').update(input).eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function addPayment(input: PaymentInput): Promise<void> {
  const { error } = await supabase.from('shipment_payments').insert(input);
  if (error) throw new Error(SAVE_ERROR);
}

export async function setPaymentVerified(id: string, verified: boolean): Promise<void> {
  const { error } = await supabase.from('shipment_payments').update({ verified }).eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function saveShipmentFees(shipmentId: string, amounts: Record<FeeCategory, number | null>): Promise<void> {
  const { data, error: loadError } = await supabase.from('shipment_fees').select('id, label').eq('shipment_id', shipmentId);
  if (loadError) throw new Error(SAVE_ERROR);
  const existing = (data ?? []) as { id: string; label: string }[];

  for (const category of FEE_CATEGORIES) {
    const rows = existing.filter((row) => row.label === category);
    const [keep, ...extra] = rows;
    const amount = amounts[category];
    const removeIds = amount === null ? rows.map((row) => row.id) : extra.map((row) => row.id);

    if (removeIds.length > 0) {
      const { error } = await supabase.from('shipment_fees').delete().in('id', removeIds);
      if (error) throw new Error(SAVE_ERROR);
    }
    if (amount === null) continue;
    if (keep) {
      const { error } = await supabase.from('shipment_fees').update({ amount }).eq('id', keep.id);
      if (error) throw new Error(SAVE_ERROR);
    } else {
      const { error } = await supabase.from('shipment_fees').insert({ shipment_id: shipmentId, label: category, amount });
      if (error) throw new Error(SAVE_ERROR);
    }
  }
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from('shipment_payments').delete().eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}
