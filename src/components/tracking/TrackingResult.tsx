import { CalendarClock, CheckCircle2, Clock, MapPin, PackageX, PauseCircle, Route } from 'lucide-react';
import { STATUS_LABELS, formatDate, formatDateTime } from '@/lib/format';
import ShipmentDetailsPanel from '@/components/tracking/ShipmentDetailsPanel';
import type { ShipmentStatus, TrackedShipment } from '@/types/logistics';

const STATUS_TONE: Record<ShipmentStatus, string> = {
  received: 'bg-royal/30 text-royal-300 ring-royal-500/60',
  processing: 'bg-royal/30 text-royal-300 ring-royal-500/60',
  in_transit: 'bg-royal-500/30 text-royal-300 ring-royal-500/60',
  arrived: 'bg-gold/20 text-gold-light ring-gold/60',
  customs: 'bg-gold/20 text-gold-light ring-gold/60',
  out_for_delivery: 'bg-gold/20 text-gold-light ring-gold/60',
  delivered: 'bg-success/25 text-success-light ring-success/60',
  delayed: 'bg-danger/25 text-danger-light ring-danger/60',
  on_hold: 'bg-danger/25 text-danger-light ring-danger/60',
};

const STATUS_ORDER: ShipmentStatus[] = [
  'received',
  'processing',
  'in_transit',
  'arrived',
  'customs',
  'out_for_delivery',
  'delivered',
];

export default function TrackingResult({ shipment }: { shipment: TrackedShipment }) {
  const latestEvents = [...shipment.events].reverse();
  const currentIndex = STATUS_ORDER.indexOf(shipment.status);

  return (
    <div className="card-surface space-y-8 p-6 sm:p-8 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-mist">Tracking number</p>
          <p className="mt-1 font-mono text-lg font-bold tracking-wide text-gold-light">{shipment.tracking_number}</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ${STATUS_TONE[shipment.status]}`}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {STATUS_LABELS[shipment.status]}
        </span>
      </div>

      <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Current location
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white">{shipment.current_location || 'Not yet available'}</dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist">
            <Route className="h-3.5 w-3.5" aria-hidden="true" /> Destination
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white">
            {[shipment.destination_city, shipment.destination_country].filter(Boolean).join(', ') || '-'}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Created / Last update
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white">
            {formatDate(shipment.created_at)} · {formatDateTime(shipment.updated_at)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> Estimated delivery
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white">
            {shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : 'To be confirmed'}
          </dd>
        </div>
      </dl>

      <ShipmentDetailsPanel shipment={shipment} />

      {shipment.status === 'on_hold' && (
        <div role="status" className="flex gap-4 rounded-xl border border-danger/50 bg-danger/10 p-5">
          <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-light" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-white">This shipment is on hold</p>
            {shipment.on_hold_reason && <p className="mt-1 text-sm text-white/80">{shipment.on_hold_reason}</p>}
          </div>
        </div>
      )}

      {shipment.return_to_sender && (
        <div role="status" className="flex gap-4 rounded-xl border border-gold/50 bg-gold/10 p-5">
          <PackageX className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-white">This shipment is being returned to the sender</p>
            {shipment.return_reason && <p className="mt-1 text-sm text-white/80">{shipment.return_reason}</p>}
          </div>
        </div>
      )}

      {shipment.status !== 'delayed' && shipment.status !== 'on_hold' && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Delivery progress</h3>
          <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4 lg:grid-cols-7" aria-label="Shipment progress">
            {STATUS_ORDER.map((step, index) => {
              const reached = currentIndex >= index;
              return (
                <li key={step} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ring-4 ${
                      reached ? 'bg-gold ring-gold/25' : 'bg-white/20 ring-white/5'
                    }`}
                    aria-hidden="true"
                  />
                  <span className={`text-xs font-semibold leading-snug ${reached ? 'text-white' : 'text-mist/60'}`}>
                    {STATUS_LABELS[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Shipment history</h3>
        {latestEvents.length === 0 ? (
          <p className="mt-4 text-sm text-mist">No updates have been recorded yet.</p>
        ) : (
          <ol className="relative mt-5 space-y-6 border-l border-white/15 pl-6">
            {latestEvents.map((event, index) => (
              <li key={`${event.event_time}-${index}`} className="relative">
                <span
                  className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ${
                    index === 0 ? 'bg-gold ring-gold/25' : 'bg-royal-500 ring-royal-500/20'
                  }`}
                  aria-hidden="true"
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-mist">{formatDateTime(event.event_time)}</p>
                <p className="mt-1 text-sm font-bold text-white">{STATUS_LABELS[event.status]}</p>
                {event.location && <p className="mt-1 text-sm text-mist">{event.location}</p>}
                {event.description && <p className="mt-1 text-sm text-mist/90">{event.description}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
