import { useState, type FormEvent } from 'react';
import { AlertCircle, ChevronDown, Loader2, Search, PackageSearch, RotateCcw } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import TrackingResult from '@/components/tracking/TrackingResult';
import TrackingFilterFields from '@/components/tracking/TrackingFilterFields';
import TrackingVerification from '@/components/tracking/TrackingVerification';
import {
  EMPTY_TRACKING_FILTERS,
  countActiveFilters,
  verifyTrackingFilters,
  type FilterCheck,
  type TrackingFilters,
} from '@/components/tracking/trackingFilters';
import { trackShipment } from '@/services/trackingService';
import { validateShipmentDetails, type ShipmentDetailErrors } from '@/dashboard/shipmentDetailForm';
import type { TrackedShipment } from '@/types/logistics';

type LookupState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; shipment: TrackedShipment; checks: FilterCheck[] }
  | { kind: 'not_found' }
  | { kind: 'error'; message: string };

export default function TrackingSection() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [inputError, setInputError] = useState('');
  const [lookup, setLookup] = useState<LookupState>({ kind: 'idle' });
  const [filters, setFilters] = useState<TrackingFilters>(EMPTY_TRACKING_FILTERS);
  const [filterErrors, setFilterErrors] = useState<ShipmentDetailErrors>({});
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = countActiveFilters(filters);

  const updateFilter = <K extends keyof TrackingFilters>(key: K, value: TrackingFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = trackingNumber.trim();

    if (value.length < 3 || value.length > 40) {
      setInputError('Please enter a valid tracking number.');
      return;
    }

    const errors = validateShipmentDetails(filters);
    setFilterErrors(errors);
    if (Object.keys(errors).length > 0) {
      setShowFilters(true);
      return;
    }

    setInputError('');
    setLookup({ kind: 'loading' });

    try {
      const shipment = await trackShipment(value);
      setLookup(
        shipment
          ? { kind: 'found', shipment, checks: verifyTrackingFilters(filters, shipment) }
          : { kind: 'not_found' },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tracking is unavailable right now.';
      setLookup({ kind: 'error', message });
    }
  };

  return (
    <section id="track" className="relative overflow-hidden bg-charcoal py-20 sm:py-28">
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-royal/20 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Shipment Tracking"
          title="Track Your Shipment"
          description="Enter your tracking number to view your shipment information and delivery progress."
        />

        <form onSubmit={handleSubmit} className="card-surface mt-12 p-4 sm:p-6" noValidate>
          <label htmlFor="tracking-number" className="field-label">
            Tracking number
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <PackageSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mist" aria-hidden="true" />
              <input
                id="tracking-number"
                name="tracking-number"
                type="text"
                autoComplete="off"
                placeholder="e.g. AFS1A2B3C4D5"
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                aria-invalid={inputError ? true : undefined}
                aria-describedby={inputError ? 'tracking-error' : undefined}
                className="field-input pl-12 font-mono uppercase tracking-wide"
              />
            </div>
            <button type="submit" disabled={lookup.kind === 'loading'} className="btn-primary sm:min-w-[200px]">
              {lookup.kind === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              {lookup.kind === 'loading' ? 'Tracking...' : 'Track Shipment'}
            </button>
          </div>
          {inputError && (
            <p id="tracking-error" role="alert" className="mt-3 text-sm font-medium text-danger-light">
              {inputError}
            </p>
          )}

          <div className="mt-5 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              aria-expanded={showFilters}
              aria-controls="tracking-filters"
              className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-gold-light transition-colors hover:text-gold"
            >
              <span>
                Verify with shipment details (optional)
                {activeFilters > 0 && <span className="ml-2 text-xs text-mist">{activeFilters} selected</span>}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <p className="mt-2 text-xs text-mist">Your tracking number is all you need. These fields only confirm the details already on file.</p>

            {showFilters && (
              <div id="tracking-filters" className="mt-5 animate-fade-up">
                <TrackingFilterFields filters={filters} errors={filterErrors} onChange={updateFilter} />
                {activeFilters > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(EMPTY_TRACKING_FILTERS);
                      setFilterErrors({});
                    }}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-mist transition-colors hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Clear selections
                  </button>
                )}
              </div>
            )}
          </div>
        </form>

        <div aria-live="polite">
          {lookup.kind === 'not_found' && (
            <div className="mt-8 rounded-2xl border border-gold/30 bg-navy/60 p-6 text-center">
              <p className="font-semibold text-white">No shipment matches that tracking number.</p>
              <p className="mt-2 text-sm text-mist">Check the number and try again, or contact us for help.</p>
            </div>
          )}
          {lookup.kind === 'error' && (
            <div role="alert" className="mt-8 flex items-start gap-3 rounded-2xl border border-danger/50 bg-danger/10 p-5 text-sm text-danger-light">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{lookup.message}</p>
            </div>
          )}
          {lookup.kind === 'found' && (
            <div className="mt-8 space-y-6">
              <TrackingVerification checks={lookup.checks} />
              <TrackingResult shipment={lookup.shipment} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
