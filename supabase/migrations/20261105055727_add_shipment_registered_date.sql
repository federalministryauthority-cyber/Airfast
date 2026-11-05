/*
# Add registration date to shipments

1. Modified Tables
- `shipments`
  - `registered_date` (date, nullable): the day the item was registered for shipment. Entered by an administrator on the shipment form. Existing shipments are left blank.

2. Security
- No policy or grant changes. The column is covered by the existing table grants and admin-only row policies.

3. Important Notes
- Nullable and without a default, so existing shipments keep working unchanged.
- Separate from the estimated delivery date, which is unchanged.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS registered_date date;
