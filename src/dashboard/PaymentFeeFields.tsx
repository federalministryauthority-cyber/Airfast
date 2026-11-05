import FormField from '@/components/ui/FormField';
import { FEE_CATEGORIES, formatMoney, type FeeCategory } from '@/lib/payments';
import type { FeeErrors, FeeForm } from '@/dashboard/shipmentFeeForm';

const inputClass = 'field-input';

interface PaymentFeeFieldsProps {
  form: FeeForm;
  errors: FeeErrors;
  total: number;
  paid: number | null;
  outstanding: number | null;
  onChange: (category: FeeCategory, value: string) => void;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-mist">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

export default function PaymentFeeFields({ form, errors, total, paid, outstanding, onChange }: PaymentFeeFieldsProps) {
  return (
    <fieldset className="md:col-span-2 space-y-5">
      <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-gold">Payment &amp; Shipment Fees</legend>
      <p className="text-xs text-mist">Leave a fee blank if it does not apply. Payments are recorded from the shipment's payment window.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {FEE_CATEGORIES.map((category) => (
          <FormField key={category} id={`fee-${category}`} label={`${category} (€)`} error={errors[category]}>
            <input
              id={`fee-${category}`}
              inputMode="decimal"
              className={inputClass}
              value={form[category]}
              placeholder="0.00"
              aria-invalid={!!errors[category]}
              onChange={(e) => onChange(category, e.target.value)}
            />
          </FormField>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Shipment Cost" value={formatMoney(total)} />
        <SummaryCard label="Amount Paid" value={paid === null ? 'Available after saving' : formatMoney(paid)} />
        <SummaryCard label="Outstanding Balance" value={outstanding === null ? 'Available after saving' : formatMoney(outstanding)} />
      </div>
    </fieldset>
  );
}
