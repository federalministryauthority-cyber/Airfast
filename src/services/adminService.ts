import { supabase } from '@/lib/supabase';
import type {
  ContactMessageRecord,
  PaymentMethod,
  ShipmentPaymentStatus,
  QuoteRequestRecord,
  QuoteStatus,
  ReviewRecord,
  ReviewStatus,
  ShipmentDetails,
  ShipmentSender,
  ShipmentRecipient,  ShipmentEventRecord,
  ShipmentHandling,
  ShipmentRecord,
  ShipmentStatus,
} from '@/types/logistics';

const LOAD_ERROR = 'Data could not be loaded. Please refresh and try again.';
const SAVE_ERROR = 'The change could not be saved. Please try again.';

export interface ShipmentInput extends ShipmentDetails, ShipmentHandling, ShipmentSender, ShipmentRecipient {
  customer_name: string;
  customer_email: string;
  status: ShipmentStatus;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  current_location: string;
  estimated_delivery: string | null;
  registered_date: string | null;
  payment_method: PaymentMethod | null;
  payment_method_other: string | null;
  payment_status?: ShipmentPaymentStatus | null;
}

export interface EventInput {
  shipment_id: string;
  event_time: string;
  status: ShipmentStatus;
  location: string;
  description: string;
}

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error('Your session could not be checked.');
  return data.session;
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Email or password is incorrect.');
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

export async function isCurrentUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error('Administrator access could not be verified.');
  return data !== null;
}

export async function fetchShipments(): Promise<ShipmentRecord[]> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(LOAD_ERROR);
  return (data ?? []) as ShipmentRecord[];
}

export async function createShipment(input: ShipmentInput): Promise<{ id: string; tracking_number: string }> {
  const { data, error } = await supabase
    .from('shipments')
    .insert(input)
    .select('id, tracking_number')
    .single();
  if (error || !data?.id || !data?.tracking_number) throw new Error(SAVE_ERROR);
  return { id: data.id as string, tracking_number: data.tracking_number as string };
}

export async function updateShipment(id: string, input: Partial<ShipmentInput>): Promise<void> {
  const { error } = await supabase
    .from('shipments')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function deleteShipment(id: string): Promise<void> {
  const { error } = await supabase.from('shipments').delete().eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function fetchShipmentEvents(shipmentId: string): Promise<ShipmentEventRecord[]> {
  const { data, error } = await supabase
    .from('shipment_events')
    .select('*')
    .eq('shipment_id', shipmentId)
    .order('event_time', { ascending: false });
  if (error) throw new Error(LOAD_ERROR);
  return (data ?? []) as ShipmentEventRecord[];
}

export async function addShipmentEvent(input: EventInput): Promise<void> {
  const { error } = await supabase.from('shipment_events').insert(input);
  if (error) throw new Error(SAVE_ERROR);
}

export async function deleteShipmentEvent(id: string): Promise<void> {
  const { error } = await supabase.from('shipment_events').delete().eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function fetchQuoteRequests(): Promise<QuoteRequestRecord[]> {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(LOAD_ERROR);
  return (data ?? []) as QuoteRequestRecord[];
}

export async function updateQuoteRequest(
  id: string,
  input: { status: QuoteStatus; admin_response: string },
): Promise<void> {
  const { error } = await supabase
    .from('quote_requests')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function fetchContactMessages(): Promise<ContactMessageRecord[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(LOAD_ERROR);
  return (data ?? []) as ContactMessageRecord[];
}

export async function setContactMessageRead(id: string, isRead: boolean): Promise<void> {
  const { error } = await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}

export async function fetchAllReviews(): Promise<ReviewRecord[]> {
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(LOAD_ERROR);
  return (data ?? []) as ReviewRecord[];
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const { error } = await supabase.from('customer_reviews').update({ status }).eq('id', id);
  if (error) throw new Error(SAVE_ERROR);
}
