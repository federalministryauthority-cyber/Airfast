/*
# Add On Hold status and independent Return to Sender details

Plain-English summary
Shipments can now be placed On Hold with a reason, and separately flagged for Return to Sender with their own reason. The two are independent: a shipment can be returned to sender without being on hold, and the hold reason is only meaningful while the status is On Hold. Customer tracking shows these details when they apply.

1. Modified table: shipments
- status: adds the value on_hold
- on_hold_reason (new, nullable): reason shown while the shipment is On Hold, up to 500 characters
- return_to_sender (new, boolean, default false): whether the shipment is being returned to the sender
- return_reason (new, nullable): reason for the return, up to 500 characters

2. Modified table: shipment_events
- status: adds the value on_hold so timeline entries can record a hold

3. Function: track_shipment(text)
- Same signature and access rules. Returns on_hold_reason only while the status is on_hold, and returns return_to_sender and return_reason. Customer name and email are still never returned.

4. Security
- No new tables. Existing row level security policies and grants are unchanged.
- track_shipment keeps its existing grants (anon and authenticated only).

5. Notes
- Existing shipments default to return_to_sender = false and have no hold or return reasons.
- All statements are idempotent (IF NOT EXISTS, DROP CONSTRAINT IF EXISTS, CREATE OR REPLACE).
*/

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS on_hold_reason text,
  ADD COLUMN IF NOT EXISTS return_to_sender boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS return_reason text;

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_on_hold_reason_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_on_hold_reason_check
  CHECK (on_hold_reason IS NULL OR char_length(on_hold_reason) <= 500);

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_return_reason_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_return_reason_check
  CHECK (return_reason IS NULL OR char_length(return_reason) <= 500);

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_status_check
  CHECK (status = ANY (ARRAY['received'::text, 'processing'::text, 'in_transit'::text, 'arrived'::text, 'customs'::text, 'out_for_delivery'::text, 'delivered'::text, 'delayed'::text, 'on_hold'::text]));

ALTER TABLE shipment_events DROP CONSTRAINT IF EXISTS shipment_events_status_check;
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_status_check
  CHECK (status = ANY (ARRAY['received'::text, 'processing'::text, 'in_transit'::text, 'arrived'::text, 'customs'::text, 'out_for_delivery'::text, 'delivered'::text, 'delayed'::text, 'on_hold'::text]));

CREATE OR REPLACE FUNCTION public.track_shipment(p_tracking_number text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_shipment shipments%ROWTYPE;
  v_events jsonb;
BEGIN
  IF p_tracking_number IS NULL OR char_length(trim(p_tracking_number)) NOT BETWEEN 3 AND 40 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_shipment
  FROM shipments
  WHERE tracking_number = upper(trim(p_tracking_number))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'event_time', e.event_time,
      'status', e.status,
      'location', e.location,
      'description', e.description
    ) ORDER BY e.event_time ASC), '[]'::jsonb)
  INTO v_events
  FROM shipment_events e
  WHERE e.shipment_id = v_shipment.id;

  RETURN jsonb_build_object(
    'tracking_number', v_shipment.tracking_number,
    'status', v_shipment.status,
    'origin_country', v_shipment.origin_country,
    'origin_city', v_shipment.origin_city,
    'destination_country', v_shipment.destination_country,
    'destination_city', v_shipment.destination_city,
    'current_location', v_shipment.current_location,
    'estimated_delivery', v_shipment.estimated_delivery,
    'created_at', v_shipment.created_at,
    'updated_at', v_shipment.updated_at,
    'transport_method', v_shipment.transport_method,
    'shipment_category', v_shipment.shipment_category,
    'shipment_contents', v_shipment.shipment_contents,
    'animal_type', v_shipment.animal_type,
    'animal_count', v_shipment.animal_count,
    'collection_location', v_shipment.collection_location,
    'special_handling', v_shipment.special_handling,
    'veterinary_documentation', v_shipment.veterinary_documentation,
    'on_hold_reason', CASE WHEN v_shipment.status = 'on_hold' THEN v_shipment.on_hold_reason ELSE NULL END,
    'return_to_sender', v_shipment.return_to_sender,
    'return_reason', CASE WHEN v_shipment.return_to_sender THEN v_shipment.return_reason ELSE NULL END,
    'events', v_events
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.track_shipment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_shipment(text) TO anon, authenticated;
