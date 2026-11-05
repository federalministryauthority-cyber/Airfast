/*
# Add Payment Method to shipments

Plain-English summary
Each shipment can now record its Payment Method, chosen from Bank Transfer, PayPal, Cash or Other. When Other is chosen, the administrator types the method name.

1. Modified table: shipments
- New column `payment_method` (text, optional): bank_transfer, paypal, cash or other. Empty means not recorded.
- New column `payment_method_other` (text, optional): the typed name, required only when the method is other (up to 60 characters).

2. Security
- No change to row level security or grants. The existing table grants already cover new columns.

3. Notes
- Idempotent: columns are added only if missing, and the rule is dropped and recreated.
- Existing shipments keep an empty payment method.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS payment_method_other text;

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_payment_method_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('bank_transfer', 'paypal', 'cash', 'other'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_payment_method_other_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_payment_method_other_check
  CHECK (
    (payment_method = 'other' AND payment_method_other IS NOT NULL AND char_length(btrim(payment_method_other)) BETWEEN 1 AND 60)
    OR (payment_method IS DISTINCT FROM 'other' AND payment_method_other IS NULL)
  );
