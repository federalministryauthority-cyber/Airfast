import SelectField from '@/components/ui/SelectField';
import FormField from '@/components/ui/FormField';
import ShipmentContentsField from '@/components/forms/ShipmentContentsField';
import {
  ANIMAL_TYPE_OPTIONS,
  SHIPMENT_CATEGORY_OPTIONS,
  SPECIAL_HANDLING_OPTIONS,
  TRANSPORT_METHOD_OPTIONS,
  VETERINARY_DOCUMENT_OPTIONS,
} from '@/data/shipmentOptions';
import type { ShipmentDetailErrors } from '@/dashboard/shipmentDetailForm';
import { retainContentsForCategory } from '@/data/shipmentContents';
import { DESTINATION_OPTIONS, type TrackingFilters } from '@/components/tracking/trackingFilters';

const inputClass = 'field-input';
const ANY = 'Any';

interface TrackingFilterFieldsProps {
  filters: TrackingFilters;
  errors: ShipmentDetailErrors;
  onChange: <K extends keyof TrackingFilters>(key: K, value: TrackingFilters[K]) => void;
}

export default function TrackingFilterFields({ filters, errors, onChange }: TrackingFilterFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SelectField id="track-transport" label="Transportation Method" emptyLabel={ANY} options={TRANSPORT_METHOD_OPTIONS} value={filters.transport_method} onChange={(v) => onChange('transport_method', v)} />
      <SelectField id="track-category" label="Shipment Category" emptyLabel={ANY} options={SHIPMENT_CATEGORY_OPTIONS} value={filters.shipment_category} onChange={(v) => { onChange('shipment_category', v); onChange('shipment_contents', retainContentsForCategory(filters.shipment_contents, v)); }} />
      <div className="sm:col-span-2 lg:col-span-3">
        <ShipmentContentsField id="track-contents" category={filters.shipment_category} value={filters.shipment_contents} onChange={(v) => onChange('shipment_contents', v)} />
      </div>
      <SelectField id="track-animal" label="Animal Type" emptyLabel={ANY} options={ANIMAL_TYPE_OPTIONS} value={filters.animal_type} onChange={(v) => onChange('animal_type', v)} />
      <FormField id="track-animal-count" label="Number of Animals" error={errors.animal_count}>
        <input id="track-animal-count" type="number" min={1} max={999} inputMode="numeric" className={inputClass} value={filters.animal_count} onChange={(e) => onChange('animal_count', e.target.value)} />
      </FormField>
      <FormField id="track-collection" label="Collection Location" error={errors.collection_location}>
        <input id="track-collection" className={inputClass} value={filters.collection_location} onChange={(e) => onChange('collection_location', e.target.value)} />
      </FormField>
      <SelectField id="track-destination" label="Destination Country" emptyLabel={ANY} options={DESTINATION_OPTIONS} value={filters.destination_country} onChange={(v) => onChange('destination_country', v)} />
      <SelectField id="track-handling" label="Special Handling" emptyLabel={ANY} options={SPECIAL_HANDLING_OPTIONS} value={filters.special_handling} onChange={(v) => onChange('special_handling', v)} />
      <SelectField id="track-vet" label="Veterinary Documentation" emptyLabel={ANY} options={VETERINARY_DOCUMENT_OPTIONS} value={filters.veterinary_documentation} onChange={(v) => onChange('veterinary_documentation', v)} />
    </div>
  );
}
