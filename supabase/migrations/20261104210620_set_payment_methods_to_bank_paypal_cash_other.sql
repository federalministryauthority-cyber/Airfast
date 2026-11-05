/*
# Limit payment methods to the four supported options

Plain-English summary
Payments can now be recorded by Bank Transfer, PayPal, Cash or Other. The previous Card, Mobile Money and Cheque options are removed. Existing records are checked first, and the change is blocked if any payment still uses a removed method.

1. Modified table: shipment_payments
- The allowed values for the method column become: bank_transfer, paypal, cash, other.

2. Security
- No change to row level security or grants.

3. Notes
- The migration stops with an error, leaving the old rules in place, if any record uses a method being removed.
- Idempotent: the check is dropped if it exists and recreated.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM shipment_payments WHERE method NOT IN ('bank_transfer', 'paypal', 'cash', 'other')
  ) THEN
    RAISE EXCEPTION 'Payments use a method that is being removed. Update those records first.';
  END IF;
END $$;

ALTER TABLE shipment_payments DROP CONSTRAINT IF EXISTS shipment_payments_method_check;
ALTER TABLE shipment_payments ADD CONSTRAINT shipment_payments_method_check
  CHECK (method IN ('bank_transfer', 'paypal', 'cash', 'other'));
