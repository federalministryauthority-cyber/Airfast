import { supabase } from '@/lib/supabase';
import type { TrackedShipment } from '@/types/logistics';

export async function trackShipment(trackingNumber: string): Promise<TrackedShipment | null> {
  const { data, error } = await supabase.rpc('track_shipment', {
    p_tracking_number: trackingNumber.trim(),
  });

  if (error) {
    throw new Error('We could not load tracking information. Please try again.');
  }

  if (data === null || data === undefined) {
    return null;
  }

  const shipment = data as TrackedShipment;
  if (typeof shipment !== 'object' || !Array.isArray(shipment.events)) {
    throw new Error('Tracking information was returned in an unexpected format.');
  }

  return shipment;
}
