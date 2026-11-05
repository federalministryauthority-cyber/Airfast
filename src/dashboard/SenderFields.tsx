import FormField from '@/components/ui/FormField';
import type { SenderErrors, SenderForm } from '@/dashboard/senderForm';

interface SenderFieldsProps {
  form: SenderForm;
  errors: SenderErrors;
  onChange: <K extends keyof SenderForm>(key: K, value: SenderForm[K]) => void;
}

const inputClass = 'field-input';

export default function SenderFields({ form, errors, onChange }: SenderFieldsProps) {
  const text = (key: keyof SenderForm) => (e: { target: { value: string } }) => onChange(key, e.target.value);

  return (
    <fieldset className="md:col-span-2 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-2">
      <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-gold">Sender Information</legend>

      <FormField id="sender-name" label="Full Name" required error={errors.sender_name}>
        <input id="sender-name" className={inputClass} value={form.sender_name} onChange={text('sender_name')} autoComplete="off" />
      </FormField>
      <FormField id="sender-email" label="Email Address" required error={errors.sender_email}>
        <input id="sender-email" type="email" className={inputClass} value={form.sender_email} onChange={text('sender_email')} autoComplete="off" />
      </FormField>
      <FormField id="sender-phone" label="Phone Number (with country code)" required error={errors.sender_phone}>
        <input id="sender-phone" type="tel" className={inputClass} value={form.sender_phone} onChange={text('sender_phone')} placeholder="+44 20 7946 0000" autoComplete="off" />
      </FormField>
      <FormField id="sender-alt-phone" label="Alternative Phone (optional)" error={errors.sender_alt_phone}>
        <input id="sender-alt-phone" type="tel" className={inputClass} value={form.sender_alt_phone} onChange={text('sender_alt_phone')} placeholder="+44 20 7946 0001" autoComplete="off" />
      </FormField>
      <FormField id="sender-country" label="Country" required error={errors.sender_country}>
        <input id="sender-country" className={inputClass} value={form.sender_country} onChange={text('sender_country')} autoComplete="off" />
      </FormField>
      <FormField id="sender-state" label="State / Region" required error={errors.sender_state}>
        <input id="sender-state" className={inputClass} value={form.sender_state} onChange={text('sender_state')} autoComplete="off" />
      </FormField>
      <FormField id="sender-city" label="City / Town" required error={errors.sender_city}>
        <input id="sender-city" className={inputClass} value={form.sender_city} onChange={text('sender_city')} autoComplete="off" />
      </FormField>
      <FormField id="sender-district" label="District / Neighborhood" required error={errors.sender_district}>
        <input id="sender-district" className={inputClass} value={form.sender_district} onChange={text('sender_district')} autoComplete="off" />
      </FormField>
      <FormField id="sender-street" label="Street Name" required error={errors.sender_street}>
        <input id="sender-street" className={inputClass} value={form.sender_street} onChange={text('sender_street')} autoComplete="off" />
      </FormField>
      <FormField id="sender-building" label="House / Building Number" required error={errors.sender_building_number}>
        <input id="sender-building" className={inputClass} value={form.sender_building_number} onChange={text('sender_building_number')} autoComplete="off" />
      </FormField>
      <div className="md:col-span-2">
        <FormField id="sender-pickup" label="Complete Pickup Address" required error={errors.sender_pickup_address}>
          <textarea id="sender-pickup" rows={3} className={inputClass} value={form.sender_pickup_address} onChange={text('sender_pickup_address')} />
        </FormField>
      </div>
      <FormField id="sender-landmark" label="Landmark (optional)" error={errors.sender_landmark}>
        <input id="sender-landmark" className={inputClass} value={form.sender_landmark} onChange={text('sender_landmark')} autoComplete="off" />
      </FormField>
      <FormField id="sender-postal" label="Postal Code (optional)" error={errors.sender_postal_code}>
        <input id="sender-postal" className={inputClass} value={form.sender_postal_code} onChange={text('sender_postal_code')} autoComplete="off" />
      </FormField>
    </fieldset>
  );
}
