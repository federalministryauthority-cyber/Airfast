import { useState } from 'react';
import { ArrowRight, MapPin, X } from 'lucide-react';
import { DESTINATIONS, type DestinationItem } from '@/data/siteContent';
import SectionHeading from '@/components/ui/SectionHeading';
import { useTranslation } from '@/i18n/LanguageProvider';

function DestinationCard({
  destination,
  active,
  onSelect,
}: {
  destination: DestinationItem;
  active: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const name = t(destination.nameKey);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border p-5 text-left shadow-premium transition duration-300 hover:-translate-y-1 ${
        active
          ? 'border-gold bg-royal-gradient ring-2 ring-gold/50'
          : 'border-royal-500/40 bg-royal-600/90 hover:border-gold/60 hover:bg-royal-500'
      }`}
    >
      <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 transition duration-500 group-hover:scale-150" aria-hidden="true" />
      <img
        src={`https://flagcdn.com/w80/${destination.flagCode}.png`}
        srcSet={`https://flagcdn.com/w160/${destination.flagCode}.png 2x`}
        alt={t('destinations.flagAlt', { name })}
        width={40}
        height={27}
        loading="lazy"
        className="h-7 w-10 rounded-sm object-cover shadow ring-1 ring-white/30"
      />
      <span className="relative text-lg font-bold text-white">{name}</span>
      <span className="relative inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-light">
        Shipping information
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </button>
  );
}

export default function DestinationsSection() {
  const { t } = useTranslation();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const selected = DESTINATIONS.find((destination) => destination.code === selectedCode) ?? null;
  const selectedName = selected ? t(selected.nameKey) : '';

  return (
    <section id="destinations" className="bg-navy py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Shipping Destinations"
          title="Connecting Europe, one route at a time"
          description="Select a country to see how we can support shipments to or from it. Route availability and timings are confirmed when you request a quote."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {DESTINATIONS.map((destination) => (
            <DestinationCard
              key={destination.code}
              destination={destination}
              active={destination.code === selectedCode}
              onSelect={() => setSelectedCode(destination.code === selectedCode ? null : destination.code)}
            />
          ))}
        </div>

        {selected && (
          <div
            role="region"
            aria-label={t('destinations.regionLabel', { name: selectedName })}
            className="card-surface relative mt-10 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between animate-fade-up"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-royal/40 ring-1 ring-gold/40">
                <MapPin className="h-6 w-6 text-gold-light" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">{t('destinations.heading', { name: selectedName })}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
                  {t('destinations.body', { name: selectedName })}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <a href="#quote" className="btn-primary">
                Request a Quote
              </a>
              <button
                type="button"
                onClick={() => setSelectedCode(null)}
                className="btn-secondary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
