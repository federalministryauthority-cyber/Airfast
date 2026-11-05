import FormField from '@/components/ui/FormField';
import type { RecipientErrors, RecipientForm } from '@/dashboard/recipientForm';

interface RecipientFieldsProps {
  form: RecipientForm;
  errors: RecipientErrors;
  onChange: <K extends keyof RecipientForm>(key: K, value: RecipientForm[K]) => void;
}

const inputClass = 'field-input';

export default function RecipientFields({ form, errors, onChange }: RecipientFieldsProps) {
  const text = (key: keyof RecipientForm) => (e: { target: { value: string } }) => onChange(key, e.target.value);

  return (
    <fieldset className="md:col-span-2 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-2">
      <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-gold">Recipient Information</legend>

      <FormField id="recipient-name" label="Full Name" required error={errors.recipient_name}>
        <input id="recipient-name" className={inputClass} value={form.recipient_name} onChange={text('recipient_name')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-email" label="Email Address" required error={errors.recipient_email}>
        <input id="recipient-email" type="email" className={inputClass} value={form.recipient_email} onChange={text('recipient_email')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-phone" label="Phone Number (with country code)" required error={errors.recipient_phone}>
        <input id="recipient-phone" type="tel" className={inputClass} value={form.recipient_phone} onChange={text('recipient_phone')} placeholder="+1 212 555 0100" autoComplete="off" />
      </FormField>
      <FormField id="recipient-alt-phone" label="Alternative Phone (optional)" error={errors.recipient_alt_phone}>
        <input id="recipient-alt-phone" type="tel" className={inputClass} value={form.recipient_alt_phone} onChange={text('recipient_alt_phone')} placeholder="+1 212 555 0101" autoComplete="off" />
      </FormField>
      <FormField id="recipient-dest-country" label="Destination Country" required error={errors.destination_country}>
        <input id="recipient-dest-country" className={inputClass} value={form.destination_country} onChange={text('destination_country')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-state" label="State / Region" required error={errors.recipient_state}>
        <input id="recipient-state" className={inputClass} value={form.recipient_state} onChange={text('recipient_state')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-dest-city" label="City / Town" required error={errors.destination_city}>
        <input id="recipient-dest-city" className={inputClass} value={form.destination_city} onChange={text('destination_city')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-district" label="District / Neighborhood" required error={errors.recipient_district}>
        <input id="recipient-district" className={inputClass} value={form.recipient_district} onChange={text('recipient_district')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-street" label="Street Name" required error={errors.recipient_street}>
        <input id="recipient-street" className={inputClass} value={form.recipient_street} onChange={text('recipient_street')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-building" label="House / Building Number" required error={errors.recipient_building_number}>
        <input id="recipient-building" className={inputClass} value={form.recipient_building_number} onChange={text('recipient_building_number')} autoComplete="off" />
      </FormField>
      <div className="md:col-span-2">
        <FormField id="recipient-address" label="Complete Delivery Address" required error={errors.recipient_delivery_address}>
          <textarea id="recipient-address" rows={3} className={inputClass} value={form.recipient_delivery_address} onChange={text('recipient_delivery_address')} />
        </FormField>
      </div>
      <FormField id="recipient-landmark" label="Landmark (optional)" error={errors.recipient_landmark}>
        <input id="recipient-landmark" className={inputClass} value={form.recipient_landmark} onChange={text('recipient_landmark')} autoComplete="off" />
      </FormField>
      <FormField id="recipient-postal" label="Postal Code (optional)" error={errors.recipient_postal_code}>
        <input id="recipient-postal" className={inputClass} value={form.recipient_postal_code} onChange={text('recipient_postal_code')} autoComplete="off" />
      </FormField>
    </fieldset>
  );
}
