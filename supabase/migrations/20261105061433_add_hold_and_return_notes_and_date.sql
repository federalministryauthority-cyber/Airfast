/*
# Add hold notes and return date/notes to shipments

1. Modified Tables
- `shipments`
  - `on_hold_notes` (text, nullable): administrator notes explaining why the shipment is on hold. Required when the hold reason is "Other (Please Specify)".
  - `return_date` (date, nullable): the date the shipment is returned to the sender.
  - `return_notes` (text, nullable): administrator notes about the return. Required when the return reason is "Other (Please Specify)".

2. Security
- No policy or grant changes. The new columns are covered by the existing table grants and admin-only row policies.

3. Important Notes
- All columns are nullable so existing shipments keep working unchanged.
- The existing `on_hold_reason` and `return_reason` columns now store the selected reason option.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS on_hold_notes text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS return_date date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS return_notes text;
