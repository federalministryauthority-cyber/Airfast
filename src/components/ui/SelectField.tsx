import FormField from '@/components/ui/FormField';
import type { ShipmentOption } from '@/data/shipmentOptions';

const inputClass = 'field-input';

interface SelectFieldProps {
  id: string;
  label: string;
  options: readonly ShipmentOption[];
  value: string;
  onChange: (value: string) => void;
  emptyLabel?: string;
  error?: string;
}

export default function SelectField({ id, label, options, value, onChange, emptyLabel = 'Not recorded', error }: SelectFieldProps) {
  const selected = options.some((option) => option.value === value) ? value : '';
  return (
    <FormField id={id} label={label} error={error}>
      <select id={id} className={inputClass} value={selected} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-navy">
          {emptyLabel}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-navy">
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
