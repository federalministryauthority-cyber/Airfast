import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import { submitQuoteRequest, type QuoteInput } from '@/services/enquiryService';
import { isFilled, isValidEmail, isValidPhone } from '@/lib/validation';
import { SHIPPING_METHODS, type ShippingMethod } from '@/types/logistics';
import { SHIPMENT_CATEGORY_OPTIONS, isOptionValue, type ShipmentOption } from '@/data/shipmentOptions';
import ShipmentContentsField from '@/components/forms/ShipmentContentsField';
import { OTHER_CONTENTS_MAX_LENGTH, parseContents, retainContentsForCategory } from '@/data/shipmentContents';

type QuoteField = keyof QuoteInput;

const EMPTY_FORM: QuoteInput = {
  full_name: '',
  email: '',
  phone: '',
  collection_country: '',
  collection_city: '',
  destination_country: '',
  destination_city: '',
  shipment_type: '',
  parcel_contents: '',
  package_weight: '',
  package_dimensions: '',
  shipping_method: 'air',
  additional_info: '',
};

function validate(form: QuoteInput): Partial<Record<QuoteField, string>> {
  const errors: Partial<Record<QuoteField, string>> = {};
  if (!isFilled(form.full_name, 2, 120)) errors.full_name = 'Please enter your full name.';
  if (!isValidEmail(form.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!isValidPhone(form.phone.trim())) errors.phone = 'Please enter a valid phone number.';
  if (!isFilled(form.collection_country, 2, 80)) errors.collection_country = 'Please enter the collection country.';
  if (!isFilled(form.collection_city, 2, 80)) errors.collection_city = 'Please enter the collection city.';
  if (!isFilled(form.destination_country, 2, 80)) errors.destination_country = 'Please enter the destination country.';
  if (!isFilled(form.destination_city, 2, 80)) errors.destination_city = 'Please enter the destination city.';
  if (!isOptionValue(SHIPMENT_CATEGORY_OPTIONS, form.shipment_type)) errors.shipment_type = 'Please choose a shipment category.';
  if (!hasValidContents(form.parcel_contents, form.shipment_type)) errors.parcel_contents = 'Please choose the parcel contents.';
  if (!isFilled(form.package_weight, 1, 40)) errors.package_weight = 'Please enter the package weight.';
  if (!isFilled(form.package_dimensions, 1, 80)) errors.package_dimensions = 'Please enter the package dimensions.';
  if (form.additional_info.length > 2000) errors.additional_info = 'Please keep this under 2000 characters.';
  return errors;
}

function hasValidContents(value: string, category: string): boolean {
  const selection = parseContents(value);
  const allowed = retainContentsForCategory(value, category) === value.trim();
  if (selection.other !== null) return selection.other.length > 0 && selection.other.length <= OTHER_CONTENTS_MAX_LENGTH && allowed;
  return selection.items.length > 0 && allowed;
}

const inputClass = 'field-input';

function OptionSelect({
  id,
  options,
  value,
  placeholder,
  onChange,
  invalid,
}: {
  id: string;
  options: readonly ShipmentOption[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  invalid: boolean;
}) {
  return (
    <select id={id} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid}>
      <option value="" className="bg-navy">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-navy">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function QuoteForm() {
  const [form, setForm] = useState<QuoteInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<QuoteField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: QuoteField) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await submitQuoteRequest({
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your request could not be sent.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div role="status" className="card-surface flex flex-col items-center p-10 text-center animate-fade-up">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 ring-1 ring-success/50">
          <CheckCircle2 className="h-8 w-8 text-success-light" aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-2xl font-bold text-white">Thank you, your quote request has been received</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">
          Our team will review your details and contact you with a personal quotation.
        </p>
        <button type="button" onClick={() => setSubmitted(false)} className="btn-secondary mt-8">
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface grid gap-6 p-6 sm:p-8 md:grid-cols-2">
      <FormField id="quote-full-name" label="Full Name" required error={errors.full_name}>
        <input id="quote-full-name" className={inputClass} autoComplete="name" value={form.full_name} onChange={(e) => updateField('full_name')(e.target.value)} aria-invalid={!!errors.full_name} />
      </FormField>
      <FormField id="quote-email" label="Email Address" required error={errors.email}>
        <input id="quote-email" type="email" className={inputClass} autoComplete="email" value={form.email} onChange={(e) => updateField('email')(e.target.value)} aria-invalid={!!errors.email} />
      </FormField>
      <FormField id="quote-phone" label="Phone Number" required error={errors.phone}>
        <input id="quote-phone" type="tel" className={inputClass} autoComplete="tel" value={form.phone} onChange={(e) => updateField('phone')(e.target.value)} aria-invalid={!!errors.phone} />
      </FormField>
      <div aria-hidden="true" className="hidden md:block" />

      <FormField id="quote-collection-country" label="Collection Country" required error={errors.collection_country}>
        <input id="quote-collection-country" className={inputClass} value={form.collection_country} onChange={(e) => updateField('collection_country')(e.target.value)} aria-invalid={!!errors.collection_country} />
      </FormField>
      <FormField id="quote-collection-city" label="Collection City" required error={errors.collection_city}>
        <input id="quote-collection-city" className={inputClass} value={form.collection_city} onChange={(e) => updateField('collection_city')(e.target.value)} aria-invalid={!!errors.collection_city} />
      </FormField>
      <FormField id="quote-destination-country" label="Destination Country" required error={errors.destination_country}>
        <input id="quote-destination-country" className={inputClass} value={form.destination_country} onChange={(e) => updateField('destination_country')(e.target.value)} aria-invalid={!!errors.destination_country} />
      </FormField>
      <FormField id="quote-destination-city" label="Destination City" required error={errors.destination_city}>
        <input id="quote-destination-city" className={inputClass} value={form.destination_city} onChange={(e) => updateField('destination_city')(e.target.value)} aria-invalid={!!errors.destination_city} />
      </FormField>

      <FormField id="quote-method" label="Transportation Method" required>
        <select id="quote-method" className={inputClass} value={form.shipping_method} onChange={(e) => updateField('shipping_method')(e.target.value as ShippingMethod)}>
          {SHIPPING_METHODS.map((method) => (
            <option key={method.value} value={method.value} className="bg-navy">
              {method.label}
            </option>
          ))}
        </select>
      </FormField>
      <FormField id="quote-shipment-category" label="Shipment Category" required error={errors.shipment_type}>
        <OptionSelect id="quote-shipment-category" options={SHIPMENT_CATEGORY_OPTIONS} value={form.shipment_type} placeholder="Choose a category" onChange={(value) => { updateField('shipment_type')(value); setForm((current) => ({ ...current, parcel_contents: retainContentsForCategory(current.parcel_contents, value) })); }} invalid={!!errors.shipment_type} />
      </FormField>

      <div className="md:col-span-2">
        <ShipmentContentsField id="quote-contents" category={form.shipment_type} value={form.parcel_contents} required error={errors.parcel_contents} onChange={(value) => setForm((current) => ({ ...current, parcel_contents: value }))} />
      </div>
      <FormField id="quote-weight" label="Package Weight" required error={errors.package_weight}>
        <input id="quote-weight" className={inputClass} placeholder="e.g. 250 kg" value={form.package_weight} onChange={(e) => updateField('package_weight')(e.target.value)} aria-invalid={!!errors.package_weight} />
      </FormField>
      <FormField id="quote-dimensions" label="Package Dimensions" required error={errors.package_dimensions}>
        <input id="quote-dimensions" className={inputClass} placeholder="e.g. 120 x 80 x 100 cm" value={form.package_dimensions} onChange={(e) => updateField('package_dimensions')(e.target.value)} aria-invalid={!!errors.package_dimensions} />
      </FormField>

      <div className="md:col-span-2">
        <FormField id="quote-additional" label="Additional Information" error={errors.additional_info}>
          <textarea id="quote-additional" rows={4} className={inputClass} value={form.additional_info} onChange={(e) => updateField('additional_info')(e.target.value)} aria-invalid={!!errors.additional_info} />
        </FormField>
      </div>

      {submitError && (
        <p role="alert" className="md:col-span-2 rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">
          {submitError}
        </p>
      )}

      <div className="md:col-span-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-mist">Fields marked * are required.</p>
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {submitting ? 'Sending...' : 'Submit Quote Request'}
        </button>
      </div>
    </form>
  );
}
