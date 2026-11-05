/*
# Add automatic payment status to shipments

Plain-English summary
Each shipment now has a payment status: Unpaid, Partially Paid, Paid or Refunded. The status is chosen when a shipment is created and then updates by itself whenever payments are recorded, verified, removed, or when fees change.

1. Modified table: shipments
- New column `payment_status` (text, optional): unpaid, partially_paid, paid or refunded. Existing shipments are filled in from their current fees and verified payments.

2. New functions
- `compute_shipment_payment_status(shipment)`: works out the status from the fees and verified payments. Verified refunds reduce the amount paid. Unverified payments do not count.
- `refresh_shipment_payment_status()`: trigger function that recalculates the status after a payment or fee changes.

3. New triggers
- On shipment_payments: recalculates after any insert, update or delete.
- On shipment_fees: recalculates after any change, but only once the shipment has at least one payment. Until then, the status chosen at creation is kept.

4. Security
- Both functions run with the owner's rights so the status can always be updated, and are not callable by public, anon or authenticated roles directly.
- No change to row level security or table grants.

5. Notes
- Idempotent: the column, constraint, functions and triggers are recreated safely.
- Existing payment and fee records are not changed.
*/

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS payment_status text;

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_payment_status_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_payment_status_check
  CHECK (payment_status IS NULL OR payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded'));

CREATE OR REPLACE FUNCTION public.compute_shipment_payment_status(p_shipment_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric;
  v_paid numeric;
  v_refunded numeric;
  v_net numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total FROM shipment_fees WHERE shipment_id = p_shipment_id;
  SELECT COALESCE(SUM(amount) FILTER (WHERE entry_type = 'payment'), 0),
         COALESCE(SUM(amount) FILTER (WHERE entry_type = 'refund'), 0)
    INTO v_paid, v_refunded
    FROM shipment_payments
    WHERE shipment_id = p_shipment_id AND verified;
  v_net := v_paid - v_refunded;

  IF v_refunded > 0 AND v_net <= 0 THEN
    RETURN 'refunded';
  ELSIF v_total > 0 AND v_net >= v_total THEN
    RETURN 'paid';
  ELSIF v_net > 0 THEN
    RETURN 'partially_paid';
  ELSE
    RETURN 'unpaid';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_shipment_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shipment_id uuid := COALESCE(NEW.shipment_id, OLD.shipment_id);
  v_status text;
BEGIN
  IF TG_TABLE_NAME = 'shipment_fees'
     AND NOT EXISTS (SELECT 1 FROM shipment_payments WHERE shipment_id = v_shipment_id) THEN
    RETURN NULL;
  END IF;

  v_status := compute_shipment_payment_status(v_shipment_id);
  UPDATE shipments
    SET payment_status = v_status
    WHERE id = v_shipment_id AND payment_status IS DISTINCT FROM v_status;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.compute_shipment_payment_status(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_shipment_payment_status() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS refresh_payment_status_after_payment_change ON shipment_payments;
CREATE TRIGGER refresh_payment_status_after_payment_change
  AFTER INSERT OR UPDATE OR DELETE ON shipment_payments
  FOR EACH ROW EXECUTE FUNCTION public.refresh_shipment_payment_status();

DROP TRIGGER IF EXISTS refresh_payment_status_after_fee_change ON shipment_fees;
CREATE TRIGGER refresh_payment_status_after_fee_change
  AFTER INSERT OR UPDATE OR DELETE ON shipment_fees
  FOR EACH ROW EXECUTE FUNCTION public.refresh_shipment_payment_status();

UPDATE shipments
  SET payment_status = public.compute_shipment_payment_status(id)
  WHERE payment_status IS NULL;
