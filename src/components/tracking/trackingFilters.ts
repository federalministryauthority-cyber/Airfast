import { DESTINATIONS } from '@/data/siteContent';
import { parseContents } from '@/data/shipmentContents';
import type { ShipmentOption } from '@/data/shipmentOptions';
import type { ShipmentDetailForm } from '@/dashboard/shipmentDetailForm';
import type { TrackedShipment } from '@/types/logistics';

export type TrackingFilters = ShipmentDetailForm & { destination_country: string };

export const EMPTY_TRACKING_FILTERS: TrackingFilters = {
  transport_method: '',
  shipment_category: '',
  shipment_contents: '',
  animal_type: '',
  animal_count: '',
  collection_location: '',
  destination_country: '',
  special_handling: '',
  veterinary_documentation: '',
};

export const DESTINATION_OPTIONS: readonly ShipmentOption[] = DESTINATIONS.map((destination) => ({
  value: destination.name,
  label: destination.name,
}));

export type FilterCheckStatus = 'match' | 'mismatch' | 'not_recorded';

export interface FilterCheck {
  label: string;
  status: FilterCheckStatus;
}

function normalise(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value).trim().toLowerCase();
}

export function verifyTrackingFilters(filters: TrackingFilters, shipment: TrackedShipment): FilterCheck[] {
  const pairs: [string, string, string | number | null][] = [
    ['Transportation method', filters.transport_method, shipment.transport_method],
    ['Shipment category', filters.shipment_category, shipment.shipment_category],
    ['Animal type', filters.animal_type, shipment.animal_type],
    ['Number of animals', filters.animal_count, shipment.animal_count],
    ['Collection location', filters.collection_location, shipment.collection_location],
    ['Destination country', filters.destination_country, shipment.destination_country],
    ['Special handling', filters.special_handling, shipment.special_handling],
    ['Veterinary documentation', filters.veterinary_documentation, shipment.veterinary_documentation],
  ];

  const simpleChecks = pairs
    .filter(([, selected]) => selected.trim() !== '')
    .map(([label, selected, recorded]) => {
      const stored = normalise(recorded);
      const status: FilterCheckStatus =
        stored === '' ? 'not_recorded' : stored === normalise(selected) ? 'match' : 'mismatch';
      return { label, status };
    });

  return [...simpleChecks, verifyContents(filters.shipment_contents, shipment.shipment_contents)].filter(
    (check): check is FilterCheck => check !== null,
  );
}

function verifyContents(selectedValue: string, recordedValue: string | null): FilterCheck | null {
  const selected = parseContents(selectedValue);
  if (selected.items.length === 0 && selected.other === null) return null;
  const recorded = parseContents(recordedValue ?? '');
  const hasRecorded = recorded.items.length > 0 || recorded.other !== null;
  if (!hasRecorded) return { label: 'Shipment contents', status: 'not_recorded' };
  const itemsMatch = selected.items.every((item) => recorded.items.includes(item));
  const otherMatch =
    selected.other === null || (recorded.other !== null && normalise(recorded.other).includes(normalise(selected.other)));
  return { label: 'Shipment contents', status: itemsMatch && otherMatch ? 'match' : 'mismatch' };
}


export function countActiveFilters(filters: TrackingFilters): number {
  return Object.values(filters).filter((value) => value.trim() !== '').length;
}
