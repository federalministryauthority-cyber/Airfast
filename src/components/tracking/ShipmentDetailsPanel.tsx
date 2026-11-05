import { findOptionLabel, ANIMAL_TYPE_OPTIONS, SHIPMENT_CATEGORY_OPTIONS, SPECIAL_HANDLING_OPTIONS, TRANSPORT_METHOD_OPTIONS, VETERINARY_DOCUMENT_OPTIONS } from '@/data/shipmentOptions';
import { formatContents } from '@/data/shipmentContents';
import type { TrackedShipment } from '@/types/logistics';

const NOT_RECORDED = 'Not recorded';

export default function ShipmentDetailsPanel({ shipment }: { shipment: TrackedShipment }) {
  const items: [string, string][] = [
    ['Transportation method', findOptionLabel(TRANSPORT_METHOD_OPTIONS, shipment.transport_method) ?? NOT_RECORDED],
    ['Shipment category', findOptionLabel(SHIPMENT_CATEGORY_OPTIONS, shipment.shipment_category) ?? NOT_RECORDED],
    ['Shipment contents', formatContents(shipment.shipment_contents) ?? NOT_RECORDED],
    ['Collection location', shipment.collection_location || NOT_RECORDED],
    ['Special handling', findOptionLabel(SPECIAL_HANDLING_OPTIONS, shipment.special_handling) ?? NOT_RECORDED],
  ];

  if (shipment.animal_type || shipment.animal_count) {
    items.push(
      ['Animal type', findOptionLabel(ANIMAL_TYPE_OPTIONS, shipment.animal_type) ?? NOT_RECORDED],
      ['Number of animals', shipment.animal_count?.toString() ?? NOT_RECORDED],
    );
  }

  items.push(['Veterinary documentation', findOptionLabel(VETERINARY_DOCUMENT_OPTIONS, shipment.veterinary_documentation) ?? NOT_RECORDED]);

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Shipment details</h3>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-navy/60 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-mist">{label}</dt>
            <dd className="mt-2 text-sm font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
