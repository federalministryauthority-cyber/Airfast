/*
# Add sender information to shipments

Plain-English summary
Each shipment can now store full sender details: name, phone numbers with country code, email, and the complete pickup address. These fields are optional for existing shipments, which keep working unchanged.

1. Modified table: shipments (new nullable columns)
- sender_name: sender full name
- sender_phone: phone number with international country code
- sender_alt_phone: optional second phone number
- sender_email: sender email address
- sender_country, sender_state, sender_city, sender_district, sender_street
- sender_building_number: house or building number
- sender_pickup_address: complete pickup address
- sender_landmark, sender_postal_code: optional

2. Security
- No change to row level security or grants. Public tracking reads only the fields it already returns, so sender details are not exposed to customers.

3. Notes
- Idempotent: each column is added only if it does not exist.
- No existing data is changed or removed.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_name text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_phone text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_alt_phone text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_email text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_country text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_state text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_city text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_district text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_street text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_building_number text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_pickup_address text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_landmark text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS sender_postal_code text;
