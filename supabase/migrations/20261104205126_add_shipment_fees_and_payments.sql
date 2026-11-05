/*
# Add shipment fees and payment records with verification

Plain-English summary
Each shipment can now have itemised fees (for example freight, insurance, veterinary checks) and a payment history. Payments and refunds are recorded by an administrator and stay unverified until a second administrator action verifies them. Only verified payments count towards the amount paid. The database records which administrator verified each payment and when.

1. New table: shipment_fees
- id, shipment_id (linked to shipments, removed with the shipment)
- label: name of the fee (up to 120 characters)
- amount: fee amount, zero or more
- created_at

2. New table: shipment_payments
- id, shipment_id (linked to shipments, removed with the shipment)
- entry_type: payment or refund
- amount: greater than zero
- payment_date, method (bank transfer, cash, card, mobile money, cheque, other)
- transaction_reference and receipt_number: optional references (up to 120 and 60 characters)
- verified, verified_at, verified_by, verified_by_email: set automatically when verified
- recorded_by, recorded_by_email, created_at

3. Verification rules
- New payment and refund entries are always stored as unverified, whatever is sent.
- Only the verified flag can be changed after an entry is recorded, so amounts and references cannot be altered once saved.
- Verified entries cannot be deleted.

4. Security
- Both tables have row level security. Only administrators (checked with is_admin()) can read, add, change or delete them.
- No public access is granted. Customer tracking is unchanged.

5. Notes
- Existing shipments simply have no fees or payments yet.
- The statement is idempotent (IF NOT EXISTS, DROP POLICY IF EXISTS, CREATE OR REPLACE).
*/

CREATE TABLE IF NOT EXISTS shipment_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 120),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0 AND amount <= 1000000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipment_fees_shipment_id_idx ON shipment_fees (shipment_id);

CREATE TABLE IF NOT EXISTS shipment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  entry_type text NOT NULL DEFAULT 'payment' CHECK (entry_type IN ('payment', 'refund')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0 AND amount <= 1000000),
  payment_date date NOT NULL,
  method text NOT NULL CHECK (method IN ('bank_transfer', 'cash', 'card', 'mobile_money', 'cheque', 'other')),
  transaction_reference text CHECK (transaction_reference IS NULL OR char_length(transaction_reference) <= 120),
  receipt_number text CHECK (receipt_number IS NULL OR char_length(receipt_number) <= 60),
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_by_email text,
  recorded_by uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shipment_payments_shipment_id_idx ON shipment_payments (shipment_id);

CREATE OR REPLACE FUNCTION public.prepare_shipment_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.verified := false;
    NEW.verified_at := NULL;
    NEW.verified_by := NULL;
    NEW.verified_by_email := NULL;
    NEW.recorded_by := auth.uid();
    NEW.recorded_by_email := auth.jwt() ->> 'email';
  ELSIF NEW.verified AND NOT OLD.verified THEN
    NEW.verified_at := now();
    NEW.verified_by := auth.uid();
    NEW.verified_by_email := auth.jwt() ->> 'email';
  ELSIF NOT NEW.verified AND OLD.verified THEN
    NEW.verified_at := NULL;
    NEW.verified_by := NULL;
    NEW.verified_by_email := NULL;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.prepare_shipment_payment() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS shipment_payments_prepare ON shipment_payments;
CREATE TRIGGER shipment_payments_prepare
  BEFORE INSERT OR UPDATE OF verified ON shipment_payments
  FOR EACH ROW EXECUTE FUNCTION public.prepare_shipment_payment();

ALTER TABLE shipment_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_payments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE (label, amount), DELETE ON shipment_fees TO authenticated;
GRANT SELECT, INSERT, DELETE ON shipment_payments TO authenticated;
GRANT UPDATE (verified) ON shipment_payments TO authenticated;

DROP POLICY IF EXISTS "admins_select_fees" ON shipment_fees;
CREATE POLICY "admins_select_fees" ON shipment_fees FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_insert_fees" ON shipment_fees;
CREATE POLICY "admins_insert_fees" ON shipment_fees FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_fees" ON shipment_fees;
CREATE POLICY "admins_update_fees" ON shipment_fees FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_fees" ON shipment_fees;
CREATE POLICY "admins_delete_fees" ON shipment_fees FOR DELETE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_select_payments" ON shipment_payments;
CREATE POLICY "admins_select_payments" ON shipment_payments FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admins_insert_payments" ON shipment_payments;
CREATE POLICY "admins_insert_payments" ON shipment_payments FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_update_payments" ON shipment_payments;
CREATE POLICY "admins_update_payments" ON shipment_payments FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admins_delete_unverified_payments" ON shipment_payments;
CREATE POLICY "admins_delete_unverified_payments" ON shipment_payments FOR DELETE TO authenticated USING (is_admin() AND verified = false);
