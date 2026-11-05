import FormField from '@/components/ui/FormField';
import { HOLD_REASON_OPTIONS, RETURN_REASON_OPTIONS, type ShipmentOption } from '@/data/shipmentOptions';
import type { ShipmentHandlingErrors, ShipmentHandlingForm } from '@/dashboard/shipmentHandlingForm';
import type { ShipmentStatus } from '@/types/logistics';

const inputClass = 'field-input';
const OTHER_REASON = 'other';

interface ShipmentHandlingFieldsProps {
  status: ShipmentStatus;
  form: ShipmentHandlingForm;
  errors: ShipmentHandlingErrors;
  onChange: <K extends keyof ShipmentHandlingForm>(key: K, value: ShipmentHandlingForm[K]) => void;
}

function ReasonSelect({ id, options, value, invalid, onChange }: { id: string; options: readonly ShipmentOption[]; value: string; invalid: boolean; onChange: (value: string) => void }) {
  return (
    <select id={id} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid}>
      <option value="" className="bg-navy">Choose a reason</option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-navy">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function ShipmentHandlingFields({ status, form, errors, onChange }: ShipmentHandlingFieldsProps) {
  return (
    <>
      {status === 'on_hold' && (
        <>
          <FormField id="ship-hold-reason" label="Hold Reason" required error={errors.on_hold_reason}>
            <ReasonSelect id="ship-hold-reason" options={HOLD_REASON_OPTIONS} value={form.on_hold_reason} invalid={!!errors.on_hold_reason} onChange={(v) => onChange('on_hold_reason', v)} />
          </FormField>
          <FormField id="ship-hold-notes" label="Hold Notes" required={form.on_hold_reason === OTHER_REASON} error={errors.on_hold_notes}>
            <textarea id="ship-hold-notes" rows={3} className={inputClass} value={form.on_hold_notes} onChange={(e) => onChange('on_hold_notes', e.target.value)} aria-invalid={!!errors.on_hold_notes} />
          </FormField>
        </>
      )}

      <div className="md:col-span-2 rounded-xl border border-white/10 bg-navy/60 p-5">
        <label htmlFor="ship-return-toggle" className="flex cursor-pointer items-center gap-3">
          <input
            id="ship-return-toggle"
            type="checkbox"
            className="h-5 w-5 cursor-pointer accent-gold"
            checked={form.return_to_sender}
            onChange={(e) => onChange('return_to_sender', e.target.checked)}
          />
          <span className="text-sm font-bold text-white">Return to Sender</span>
        </label>
        <p className="mt-1 pl-8 text-xs text-mist">Tick this if the shipment is being sent back to the sender. It can be used with any status.</p>

        {form.return_to_sender && (
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <FormField id="ship-return-reason" label="Return Reason" required error={errors.return_reason}>
              <ReasonSelect id="ship-return-reason" options={RETURN_REASON_OPTIONS} value={form.return_reason} invalid={!!errors.return_reason} onChange={(v) => onChange('return_reason', v)} />
            </FormField>
            <FormField id="ship-return-date" label="Return Date" required error={errors.return_date}>
              <input id="ship-return-date" type="date" className={inputClass} value={form.return_date} onChange={(e) => onChange('return_date', e.target.value)} aria-invalid={!!errors.return_date} />
            </FormField>
            <div className="md:col-span-2">
              <FormField id="ship-return-notes" label="Return Notes" required={form.return_reason === OTHER_REASON} error={errors.return_notes}>
                <textarea id="ship-return-notes" rows={3} className={inputClass} value={form.return_notes} onChange={(e) => onChange('return_notes', e.target.value)} aria-invalid={!!errors.return_notes} />
              </FormField>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
