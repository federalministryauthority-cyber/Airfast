import FormField from '@/components/ui/FormField';
import SelectField from '@/components/ui/SelectField';
import { PAYMENT_METHODS, type PaymentMethod } from '@/types/logistics';

const inputClass = 'field-input';

interface ShipmentPaymentMethodFieldProps {
  method: PaymentMethod | '';
  methodOther: string;
  otherError?: string;
  onMethodChange: (method: PaymentMethod | '') => void;
  onMethodOtherChange: (value: string) => void;
}

export default function ShipmentPaymentMethodField({
  method,
  methodOther,
  otherError,
  onMethodChange,
  onMethodOtherChange,
}: ShipmentPaymentMethodFieldProps) {
  return (
    <>
      <SelectField
        id="ship-payment-method"
        label="Payment Method"
        options={PAYMENT_METHODS}
        value={method}
        onChange={(value) => onMethodChange(PAYMENT_METHODS.find((option) => option.value === value)?.value ?? '')}
      />
      {method === 'other' && (
        <FormField id="ship-payment-method-other" label="Other Payment Method" required error={otherError}>
          <input
            id="ship-payment-method-other"
            className={inputClass}
            value={methodOther}
            maxLength={60}
            placeholder="e.g. Western Union"
            aria-invalid={!!otherError}
            onChange={(e) => onMethodOtherChange(e.target.value)}
          />
        </FormField>
      )}
    </>
  );
}
