/*
# Keep payment records when a shipment is deleted

Plain-English summary
Payment records are financial history, so a shipment that has any recorded payment or refund can no longer be deleted. Deleting a shipment still removes its timeline and fees, but it is blocked while payment records exist.

1. Modified table: shipment_payments
- The link to shipments changes from remove-with-shipment to block deletion of the shipment.

2. Security
- No change to row level security or grants.

3. Notes
- Idempotent: the old constraint is dropped only if it exists, then recreated.
*/

ALTER TABLE shipment_payments DROP CONSTRAINT IF EXISTS shipment_payments_shipment_id_fkey;
ALTER TABLE shipment_payments ADD CONSTRAINT shipment_payments_shipment_id_fkey
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE RESTRICT;
