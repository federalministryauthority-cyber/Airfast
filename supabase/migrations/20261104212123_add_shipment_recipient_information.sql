/*
# Add recipient information to shipments

Plain-English summary
Each shipment can now store full recipient details, kept separate from the sender. Destination country and city continue to use the existing columns, so the route and tracking information stay unchanged.

1. Modified table: shipments (new nullable columns)
- recipient_name, recipient_phone (with country code), recipient_alt_phone (optional), recipient_email
- recipient_state, recipient_district, recipient_street, recipient_building_number
- recipient_delivery_address: complete delivery address
- recipient_landmark, recipient_postal_code: optional

2. Security
- No change to row level security or grants. Public tracking still returns only the fields it already returns, so recipient details are not exposed to customers.

3. Notes
- Idempotent: each column is added only if it does not exist.
- No existing data is changed or removed.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_name text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_phone text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_alt_phone text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_email text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_state text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_district text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_street text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_building_number text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_delivery_address text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_landmark text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS recipient_postal_code text;
