/*
# Create logistics website core schema

1. New Tables
- `admins`: list of user accounts allowed into the administrator dashboard (one row per admin, linked to the Supabase sign-in account).
- `shipments`: shipment records with a unique tracking number, status, locations, estimated delivery date and private customer contact fields (visible to admins only).
- `shipment_events`: timeline entries for a shipment (status, location, description, time).
- `quote_requests`: quotation enquiries submitted from the website, with an admin status and response field.
- `contact_messages`: messages submitted from the contact form, with a read flag for admins.
- `customer_reviews`: customer reviews submitted from the website; only approved reviews are public.

2. Functions
- `is_admin()`: returns true when the signed-in user is listed in `admins`.
- `track_shipment(p_tracking_number)`: public lookup that returns only non-private shipment fields and its timeline. Customer contact details are never returned.

3. Security
- Row Level Security is enabled on every table.
- Anonymous visitors can only: submit quote requests, contact messages and reviews (reviews must start as pending), read approved reviews, and look up a shipment through `track_shipment`.
- Only admins (checked with `is_admin()`) can read, edit or delete shipments, enquiries, messages and reviews.
- `is_admin()` and `track_shipment()` are not callable by the public role except where needed.

4. Important notes
- Tracking numbers are generated automatically by the database when a shipment is created.
- No customer personal data is exposed through public queries.
- Statements are idempotent, so this migration is safe to re-run.
*/

CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON admins TO authenticated;

DROP POLICY IF EXISTS "admins_select_self" ON admins;
CREATE POLICY "admins_select_self" ON admins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL DEFAULT ('AFS' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10))),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','processing','in_transit','arrived','customs','out_for_delivery','delivered','delayed')),
  customer_name text NOT NULL DEFAULT '' CHECK (char_length(customer_name) <= 120),
  customer_email text NOT NULL DEFAULT '' CHECK (char_length(customer_email) <= 254),
  origin_country text NOT NULL DEFAULT '' CHECK (char_length(origin_country) <= 80),
  origin_city text NOT NULL DEFAULT '' CHECK (char_length(origin_city) <= 80),
  destination_country text NOT NULL DEFAULT '' CHECK (char_length(destination_country) <= 80),
  destination_city text NOT NULL DEFAULT '' CHECK (char_length(destination_city) <= 80),
  current_location text NOT NULL DEFAULT '' CHECK (char_length(current_location) <= 160),
  estimated_delivery date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipments_status_idx ON shipments (status);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON shipments TO authenticated;

DROP POLICY IF EXISTS "admins_select_shipments" ON shipments;
CREATE POLICY "admins_select_shipments" ON shipments FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_insert_shipments" ON shipments;
CREATE POLICY "admins_insert_shipments" ON shipments FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_shipments" ON shipments;
CREATE POLICY "admins_update_shipments" ON shipments FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_shipments" ON shipments;
CREATE POLICY "admins_delete_shipments" ON shipments FOR DELETE
  TO authenticated USING (is_admin());

CREATE TABLE IF NOT EXISTS shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_time timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('received','processing','in_transit','arrived','customs','out_for_delivery','delivered','delayed')),
  location text NOT NULL DEFAULT '' CHECK (char_length(location) <= 160),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipment_events_shipment_idx ON shipment_events (shipment_id, event_time);

ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON shipment_events TO authenticated;

DROP POLICY IF EXISTS "admins_select_events" ON shipment_events;
CREATE POLICY "admins_select_events" ON shipment_events FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_insert_events" ON shipment_events;
CREATE POLICY "admins_insert_events" ON shipment_events FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_events" ON shipment_events;
CREATE POLICY "admins_update_events" ON shipment_events FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_events" ON shipment_events;
CREATE POLICY "admins_delete_events" ON shipment_events FOR DELETE
  TO authenticated USING (is_admin());

CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 5 AND 40),
  collection_country text NOT NULL CHECK (char_length(collection_country) BETWEEN 2 AND 80),
  collection_city text NOT NULL CHECK (char_length(collection_city) BETWEEN 2 AND 80),
  destination_country text NOT NULL CHECK (char_length(destination_country) BETWEEN 2 AND 80),
  destination_city text NOT NULL CHECK (char_length(destination_city) BETWEEN 2 AND 80),
  shipment_type text NOT NULL CHECK (char_length(shipment_type) BETWEEN 2 AND 80),
  package_weight text NOT NULL CHECK (char_length(package_weight) BETWEEN 1 AND 40),
  package_dimensions text NOT NULL CHECK (char_length(package_dimensions) BETWEEN 1 AND 80),
  shipping_method text NOT NULL CHECK (shipping_method IN ('air','road','sea','rail','express')),
  additional_info text NOT NULL DEFAULT '' CHECK (char_length(additional_info) <= 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','quoted','closed')),
  admin_response text NOT NULL DEFAULT '' CHECK (char_length(admin_response) <= 5000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON quote_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON quote_requests TO authenticated;

DROP POLICY IF EXISTS "public_insert_quotes" ON quote_requests;
CREATE POLICY "public_insert_quotes" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (status = 'new' AND admin_response = '');

DROP POLICY IF EXISTS "admins_select_quotes" ON quote_requests;
CREATE POLICY "admins_select_quotes" ON quote_requests FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_update_quotes" ON quote_requests;
CREATE POLICY "admins_update_quotes" ON quote_requests FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_quotes" ON quote_requests;
CREATE POLICY "admins_delete_quotes" ON quote_requests FOR DELETE
  TO authenticated USING (is_admin());

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 2 AND 160),
  message text NOT NULL CHECK (char_length(message) BETWEEN 2 AND 5000),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON contact_messages TO authenticated;

DROP POLICY IF EXISTS "public_insert_contacts" ON contact_messages;
CREATE POLICY "public_insert_contacts" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (is_read = false);

DROP POLICY IF EXISTS "admins_select_contacts" ON contact_messages;
CREATE POLICY "admins_select_contacts" ON contact_messages FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_update_contacts" ON contact_messages;
CREATE POLICY "admins_update_contacts" ON contact_messages FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_contacts" ON contact_messages;
CREATE POLICY "admins_delete_contacts" ON contact_messages FOR DELETE
  TO authenticated USING (is_admin());

CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 120),
  customer_country text NOT NULL DEFAULT '' CHECK (char_length(customer_country) <= 80),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_reviews_status_idx ON customer_reviews (status);

ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON customer_reviews TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON customer_reviews TO authenticated;

DROP POLICY IF EXISTS "public_insert_reviews" ON customer_reviews;
CREATE POLICY "public_insert_reviews" ON customer_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "public_select_approved_reviews" ON customer_reviews;
CREATE POLICY "public_select_approved_reviews" ON customer_reviews FOR SELECT
  TO anon USING (status = 'approved');

DROP POLICY IF EXISTS "admins_select_reviews" ON customer_reviews;
CREATE POLICY "admins_select_reviews" ON customer_reviews FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_update_reviews" ON customer_reviews;
CREATE POLICY "admins_update_reviews" ON customer_reviews FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_reviews" ON customer_reviews;
CREATE POLICY "admins_delete_reviews" ON customer_reviews FOR DELETE
  TO authenticated USING (is_admin());

GRANT SELECT ON customer_reviews TO anon;

CREATE OR REPLACE FUNCTION track_shipment(p_tracking_number text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    'events', v_events
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION track_shipment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION track_shipment(text) TO anon, authenticated;
