import FormField from '@/components/ui/FormField';
import SelectField from '@/components/ui/SelectField';
import ShipmentContentsField from '@/components/forms/ShipmentContentsField';
import { retainContentsForCategory } from '@/data/shipmentContents';
import {
  ANIMAL_TYPE_OPTIONS,
  SHIPMENT_CATEGORY_OPTIONS,
  SPECIAL_HANDLING_OPTIONS,
  TRANSPORT_METHOD_OPTIONS,
  VETERINARY_DOCUMENT_OPTIONS,
} from '@/data/shipmentOptions';
import type { ShipmentDetailErrors, ShipmentDetailForm } from '@/dashboard/shipmentDetailForm';

const inputClass = 'field-input';

interface ShipmentDetailFieldsProps {
  form: ShipmentDetailForm;
  errors: ShipmentDetailErrors;
  onChange: <K extends keyof ShipmentDetailForm>(key: K, value: ShipmentDetailForm[K]) => void;
}

export default function ShipmentDetailFields({ form, errors, onChange }: ShipmentDetailFieldsProps) {
  return (
    <>
      <div className="md:col-span-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gold">Shipment details</p>
        <p className="mt-1 text-xs text-mist">Shown to the customer on the tracking page. Leave blank if not known.</p>
      </div>
      <SelectField id="ship-transport" label="Transportation Method" options={TRANSPORT_METHOD_OPTIONS} value={form.transport_method} onChange={(v) => onChange('transport_method', v)} />
      <SelectField
        id="ship-category"
        label="Shipment Category"
        options={SHIPMENT_CATEGORY_OPTIONS}
        value={form.shipment_category}
        onChange={(v) => {
          onChange('shipment_category', v);
          onChange('shipment_contents', retainContentsForCategory(form.shipment_contents, v));
        }}
      />
      <div className="md:col-span-2">
        <ShipmentContentsField
          id="ship-contents"
          category={form.shipment_category}
          value={form.shipment_contents}
          error={errors.shipment_contents}
          onChange={(v) => onChange('shipment_contents', v)}
        />
      </div>
      <FormField id="ship-collection" label="Collection Location" error={errors.collection_location}>
        <input id="ship-collection" className={inputClass} value={form.collection_location} onChange={(e) => onChange('collection_location', e.target.value)} />
      </FormField>
      <SelectField id="ship-animal" label="Animal Type" options={ANIMAL_TYPE_OPTIONS} value={form.animal_type} onChange={(v) => onChange('animal_type', v)} />
      <FormField id="ship-animal-count" label="Number of Animals" error={errors.animal_count}>
        <input id="ship-animal-count" type="number" min={1} max={999} inputMode="numeric" className={inputClass} value={form.animal_count} onChange={(e) => onChange('animal_count', e.target.value)} />
      </FormField>
      <SelectField id="ship-handling" label="Special Handling" options={SPECIAL_HANDLING_OPTIONS} value={form.special_handling} onChange={(v) => onChange('special_handling', v)} />
      <SelectField id="ship-vet" label="Veterinary Documentation" options={VETERINARY_DOCUMENT_OPTIONS} value={form.veterinary_documentation} onChange={(v) => onChange('veterinary_documentation', v)} />
    </>
  );
}
