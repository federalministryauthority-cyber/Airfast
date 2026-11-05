/*
# Add shipment detail fields, quote fields and expose them to tracking

Plain-English summary
This migration extends the existing AirFast database so each shipment can record its transport method, category, contents, animal details, collection location and handling requirements. Quote requests gain a parcel contents field and support the multimodal transport option. The public tracking lookup now also returns these stored details. Nothing existing is removed or renamed, and existing rows are kept as they are.

1. Modified table: shipments (new nullable columns)
- transport_method: road, air, sea, rail or multimodal
- shipment_category: documents, small_parcels, personal_packages, commercial_goods, business_cargo or pallets
- shipment_contents: general_merchandise, electronics, clothing_textiles, food_products, machinery_equipment or other_goods
- animal_type: dog, cat, horse, bird, small_mammal, reptile, livestock or other
- animal_count: whole number from 1 to 999
- collection_location: short text, up to 160 characters
- special_handling: none, fragile_goods or other
- veterinary_documentation: not_required, provided or pending

2. Modified table: quote_requests
- shipping_method now also accepts multimodal (existing values kept)
- parcel_contents (new, nullable): same options as shipment_contents

3. Function: track_shipment(text)
- Same signature and access rules. It now also returns the transport method, category, contents, animal details, collection location, special handling and veterinary documentation. Customer name and email are still never returned.

4. Security
- No new tables. Existing row level security policies and grants on shipments and quote_requests are unchanged.
- track_shipment keeps its existing grants (anon and authenticated only).

5. Notes
- All statements are idempotent (IF NOT EXISTS, DROP CONSTRAINT IF EXISTS, CREATE OR REPLACE).
- Existing shipments and quotes simply show these fields as not recorded until staff add them.
*/

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS transport_method text,
  ADD COLUMN IF NOT EXISTS shipment_category text,
  ADD COLUMN IF NOT EXISTS shipment_contents text,
  ADD COLUMN IF NOT EXISTS animal_type text,
  ADD COLUMN IF NOT EXISTS animal_count integer,
  ADD COLUMN IF NOT EXISTS collection_location text,
  ADD COLUMN IF NOT EXISTS special_handling text,
  ADD COLUMN IF NOT EXISTS veterinary_documentation text;

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_transport_method_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_transport_method_check
  CHECK (transport_method IS NULL OR transport_method IN ('road', 'air', 'sea', 'rail', 'multimodal'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_shipment_category_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_shipment_category_check
  CHECK (shipment_category IS NULL OR shipment_category IN ('documents', 'small_parcels', 'personal_packages', 'commercial_goods', 'business_cargo', 'pallets'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_shipment_contents_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_shipment_contents_check
  CHECK (shipment_contents IS NULL OR shipment_contents IN ('general_merchandise', 'electronics', 'clothing_textiles', 'food_products', 'machinery_equipment', 'other_goods'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_animal_type_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_animal_type_check
  CHECK (animal_type IS NULL OR animal_type IN ('dog', 'cat', 'horse', 'bird', 'small_mammal', 'reptile', 'livestock', 'other'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_animal_count_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_animal_count_check
  CHECK (animal_count IS NULL OR animal_count BETWEEN 1 AND 999);

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_collection_location_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_collection_location_check
  CHECK (collection_location IS NULL OR char_length(collection_location) <= 160);

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_special_handling_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_special_handling_check
  CHECK (special_handling IS NULL OR special_handling IN ('none', 'fragile_goods', 'other'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_veterinary_documentation_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_veterinary_documentation_check
  CHECK (veterinary_documentation IS NULL OR veterinary_documentation IN ('not_required', 'provided', 'pending'));

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS parcel_contents text;

ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS quote_requests_shipping_method_check;
ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_shipping_method_check
  CHECK (shipping_method = ANY (ARRAY['air'::text, 'road'::text, 'sea'::text, 'rail'::text, 'express'::text, 'multimodal'::text]));

ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS quote_requests_parcel_contents_check;
ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_parcel_contents_check
  CHECK (parcel_contents IS NULL OR parcel_contents IN ('general_merchandise', 'electronics', 'clothing_textiles', 'food_products', 'machinery_equipment', 'other_goods'));

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
    'events', v_events
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.track_shipment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_shipment(text) TO anon, authenticated;
