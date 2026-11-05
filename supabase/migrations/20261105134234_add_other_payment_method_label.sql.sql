/*
# Add custom label for "Other" payment method

Plain-English summary
When a payment is recorded as "Other", the administrator now types the payment method name. That name is stored with the payment and must be filled in.

1. Modified table: shipment_payments
- New column `method_other` (text, optional): the administrator's own name for the method, up to 60 characters.
- New rule: when the method is "other", `method_other` must contain a name. Other methods must leave it empty.

2. Security
- No change to row level security or grants.

3. Notes
- Idempotent: the column is added only if missing, and the rule is dropped and recreated.
- No existing payment rows use "other", so no records are affected.
*/

ALTER TABLE shipment_payments ADD COLUMN IF NOT EXISTS method_other text;

ALTER TABLE shipment_payments DROP CONSTRAINT IF EXISTS shipment_payments_method_other_check;
ALTER TABLE shipment_payments ADD CONSTRAINT shipment_payments_method_other_check
  CHECK (
    (method = 'other' AND method_other IS NOT NULL AND char_length(btrim(method_other)) BETWEEN 1 AND 60)
    OR (method <> 'other' AND method_other IS NULL)
  );
