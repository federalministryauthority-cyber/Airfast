import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Plus, Receipt, Trash2 } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SelectField from '@/components/ui/SelectField';
import { addPayment, deletePayment, setPaymentVerified } from '@/services/paymentService';
import { formatMoney, paymentMethodName } from '@/lib/payments';
import { formatDate, formatDateTime } from '@/lib/format';
import { isFilled } from '@/lib/validation';
import { PAYMENT_METHODS, type PaymentEntryType, type PaymentMethod, type ShipmentPayment } from '@/types/logistics';

interface PaymentRecordsTabProps {
  shipmentId: string;
  payments: ShipmentPayment[];
  onChanged: (message: string) => void;
  onPrintReceipt: (payment: ShipmentPayment) => void;
}

const ENTRY_TYPE_OPTIONS = [
  { value: 'payment', label: 'Payment received' },
  { value: 'refund', label: 'Refund issued' },
];

const METHOD_OPTIONS = PAYMENT_METHODS.map((method) => ({ value: method.value, label: method.label }));

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PaymentRecordsTab({ shipmentId, payments, onChanged, onPrintReceipt }: PaymentRecordsTabProps) {
  const [entryType, setEntryType] = useState<PaymentEntryType>('payment');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(today);
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [methodOther, setMethodOther] = useState('');
  const [reference, setReference] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; paymentDate?: string; methodOther?: string; reference?: string; receiptNumber?: string; save?: string }>({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedAmount = amount.trim();
    const nextErrors: typeof errors = {};
    if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount) || Number(trimmedAmount) <= 0 || Number(trimmedAmount) > 1000000) {
      nextErrors.amount = 'Enter an amount above 0 with up to two decimal places.';
    }
    if (!paymentDate) nextErrors.paymentDate = 'Please choose the payment date.';
    if (method === 'other' && !isFilled(methodOther, 1, 60)) nextErrors.methodOther = 'Enter the payment method name (up to 60 characters).';
    if (reference.length > 120) nextErrors.reference = 'Please keep this under 120 characters.';
    if (receiptNumber.length > 60) nextErrors.receiptNumber = 'Please keep this under 60 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await addPayment({
        shipment_id: shipmentId,
        entry_type: entryType,
        amount: Number(trimmedAmount),
        payment_date: paymentDate,
        method,
        method_other: method === 'other' ? methodOther.trim() : null,
        transaction_reference: isFilled(reference, 1, 120) ? reference.trim() : null,
        receipt_number: isFilled(receiptNumber, 1, 60) ? receiptNumber.trim() : null,
      });
      setAmount('');
      setMethodOther('');
      setReference('');
      setReceiptNumber('');
      onChanged('Entry recorded. It will count once an administrator verifies it.');
    } catch (error) {
      setErrors({ save: error instanceof Error ? error.message : 'The entry could not be recorded.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleVerified = async (payment: ShipmentPayment) => {
    setBusyId(payment.id);
    try {
      await setPaymentVerified(payment.id, !payment.verified);
      onChanged(payment.verified ? 'Verification removed.' : 'Entry verified.');
    } catch (error) {
      setErrors({ save: error instanceof Error ? error.message : 'The entry could not be updated.' });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (payment: ShipmentPayment) => {
    setBusyId(payment.id);
    try {
      await deletePayment(payment.id);
      onChanged('Unverified entry removed.');
    } catch (error) {
      setErrors({ save: error instanceof Error ? error.message : 'The entry could not be removed.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
      <form onSubmit={handleAdd} noValidate className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Record a payment</h3>
        <SelectField id="pay-type" label="Entry type" options={ENTRY_TYPE_OPTIONS} value={entryType} onChange={(v) => setEntryType(v as PaymentEntryType)} />
        <FormField id="pay-amount" label="Amount" required error={errors.amount}>
          <input id="pay-amount" inputMode="decimal" className="field-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </FormField>
        <FormField id="pay-date" label="Payment date" required error={errors.paymentDate}>
          <input id="pay-date" type="date" className="field-input" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </FormField>
        <SelectField id="pay-method" label="Payment Method" options={METHOD_OPTIONS} value={method} onChange={(v) => setMethod(v as PaymentMethod)} />
        {method === 'other' && (
          <FormField id="pay-method-other" label="Other payment method" required error={errors.methodOther}>
            <input id="pay-method-other" className="field-input" value={methodOther} maxLength={60} onChange={(e) => setMethodOther(e.target.value)} placeholder="e.g. Western Union" />
          </FormField>
        )}
        <FormField id="pay-reference" label="Transaction reference" error={errors.reference}>
          <input id="pay-reference" className="field-input" value={reference} onChange={(e) => setReference(e.target.value)} />
        </FormField>
        <FormField id="pay-receipt" label="Receipt number" error={errors.receiptNumber}>
          <input id="pay-receipt" className="field-input" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} />
        </FormField>
        {errors.save && <p role="alert" className="text-sm text-danger-light">{errors.save}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          Record Entry
        </button>
      </form>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Payment history</h3>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-mist">No payments recorded yet.</p>
        ) : (
          <ul className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {payments.map((payment) => {
              const isRefund = payment.entry_type === 'refund';
              return (
                <li key={payment.id} className="rounded-xl border border-white/10 bg-navy/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">
                        {isRefund ? '-' : ''}
                        {formatMoney(Number(payment.amount))} <span className="font-normal text-mist">· {isRefund ? 'Refund' : 'Payment'}</span>
                      </p>
                      <p className="mt-1 text-xs text-mist">
                        {formatDate(payment.payment_date)} · {paymentMethodName(payment)}
                      </p>
                      {payment.transaction_reference && (
                        <p className="mt-1 font-mono text-xs text-mist">Ref: {payment.transaction_reference}</p>
                      )}
                      {payment.receipt_number && <p className="mt-1 font-mono text-xs text-mist">Receipt: {payment.receipt_number}</p>}
                      {payment.verified ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-success-light">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Verified by {payment.verified_by_email ?? 'an administrator'} on {formatDateTime(payment.verified_at)}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs font-semibold text-gold-light">Awaiting verification</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {busyId === payment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-mist" aria-hidden="true" />
                      ) : (
                        <>
                          <button type="button" onClick={() => void toggleVerified(payment)} className="btn-secondary !px-3 !py-1.5 !text-xs">
                            {payment.verified ? 'Unverify' : 'Verify'}
                          </button>
                          {payment.verified && (
                            <button type="button" onClick={() => onPrintReceipt(payment)} className="btn-secondary !px-3 !py-1.5 !text-xs">
                              <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                              Receipt
                            </button>
                          )}
                          {!payment.verified && (
                            <button
                              type="button"
                              onClick={() => void remove(payment)}
                              aria-label="Remove unverified entry"
                              className="icon-action hover:!border-danger hover:!text-danger-light"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
