import { supabase } from '@/lib/supabase';
import type { ReviewRecord, ShippingMethod } from '@/types/logistics';

export interface QuoteInput {
  full_name: string;
  email: string;
  phone: string;
  collection_country: string;
  collection_city: string;
  destination_country: string;
  destination_city: string;
  shipment_type: string;
  parcel_contents: string;
  package_weight: string;
  package_dimensions: string;
  shipping_method: ShippingMethod;
  additional_info: string;
}

export interface ContactInput {
  full_name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ReviewInput {
  customer_name: string;
  customer_country: string;
  rating: number;
  comment: string;
}

const SUBMIT_ERROR = 'Your message could not be sent. Please check your connection and try again.';

export async function submitQuoteRequest(input: QuoteInput): Promise<void> {
  const { error } = await supabase.from('quote_requests').insert(input);
  if (error) throw new Error(SUBMIT_ERROR);
}

export async function submitContactMessage(input: ContactInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({ ...input, is_read: false });
  if (error) throw new Error(SUBMIT_ERROR);
}

export async function submitReview(input: ReviewInput): Promise<void> {
  const { error } = await supabase.from('customer_reviews').insert({ ...input, status: 'pending' });
  if (error) throw new Error(SUBMIT_ERROR);
}

export async function fetchApprovedReviews(): Promise<ReviewRecord[]> {
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('id, customer_name, customer_country, rating, comment, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw new Error('Reviews could not be loaded right now.');
  return (data ?? []) as ReviewRecord[];
}
