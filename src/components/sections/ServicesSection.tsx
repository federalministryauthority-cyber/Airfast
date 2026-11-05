import { useState } from 'react';
import { Anchor, ChevronDown, Globe2, Plane, TrainFront, Truck, Warehouse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SERVICES, type ServiceItem } from '@/data/siteContent';
import SectionHeading from '@/components/ui/SectionHeading';
import { useTranslation } from '@/i18n/LanguageProvider';

const ICONS: Record<ServiceItem['icon'], LucideIcon> = {
  plane: Plane,
  truck: Truck,
  ship: Anchor,
  train: TrainFront,
  warehouse: Warehouse,
  globe: Globe2,
};

function ServiceCard({ service }: { service: ServiceItem }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const Icon = ICONS[service.icon];
  const detailsId = `service-details-${service.id}`;
  const title = t(service.titleKey);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-charcoal-card/70 shadow-premium transition duration-500 hover:-translate-y-1.5 hover:border-gold/50">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={service.image}
          alt={t('services.illustrationAlt', { title })}
          width={1000}
          height={700}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-royal/90 shadow-premium ring-1 ring-gold/50">
          <Icon className="h-6 w-6 text-gold-light" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-mist">{t(service.descriptionKey)}</p>

        <div
          id={detailsId}
          className={`grid transition-all duration-300 ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden">
            <p className="mt-4 rounded-xl border border-gold/20 bg-navy/60 p-4 text-sm leading-relaxed text-white/90">
              <span className="font-semibold text-gold-light">{t('services.bestFor')} </span>
              {t(service.bestForKey)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition hover:text-gold-light"
          >
            {t('services.learnMore')}
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          <a
            href="#quote"
            className="rounded-full bg-royal px-4 py-2 text-xs font-semibold text-white transition hover:bg-royal-500"
          >
            {t('services.quote')}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function ServicesSection() {
  const { t } = useTranslation();
  return (
    <section id="services" className="bg-charcoal-dark py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          description={t('services.description')}
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
