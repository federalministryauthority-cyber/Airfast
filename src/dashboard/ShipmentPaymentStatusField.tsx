import FormField from '@/components/ui/FormField';
import { PAYMENT_STATUS_LABELS } from '@/lib/payments';
import { SHIPMENT_PAYMENT_STATUSES, type ShipmentPaymentStatus } from '@/types/logistics';

const inputClass = 'field-input';

interface ShipmentPaymentStatusFieldProps {
  isEdit: boolean;
  status: ShipmentPaymentStatus | '';
  error?: string;
  onChange: (status: ShipmentPaymentStatus | '') => void;
}

export default function ShipmentPaymentStatusField({ isEdit, status, error, onChange }: ShipmentPaymentStatusFieldProps) {
  if (isEdit) {
    return (
      <div>
        <FormField id="ship-payment-status" label="Payment Status and Statements">
          <input
            id="ship-payment-status"
            className={`${inputClass} cursor-not-allowed opacity-80`}
            value={status ? PAYMENT_STATUS_LABELS[status] : 'Not set'}
            readOnly
          />
        </FormField>
        <p className="mt-2 text-xs text-slate-400">Updates automatically when payments or fees change.</p>
      </div>
    );
  }

  return (
    <FormField id="ship-payment-status" label="Payment Status and Statements" required error={error}>
      <select
        id="ship-payment-status"
        className={inputClass}
        value={status}
        aria-invalid={!!error}
        onChange={(e) => onChange(SHIPMENT_PAYMENT_STATUSES.find((option) => option === e.target.value) ?? '')}
      >
        <option value="" className="bg-navy">Choose a status</option>
        {SHIPMENT_PAYMENT_STATUSES.map((option) => (
          <option key={option} value={option} className="bg-navy">{PAYMENT_STATUS_LABELS[option]}</option>
        ))}
      </select>
    </FormField>
  );
}
