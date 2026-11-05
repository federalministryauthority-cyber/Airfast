import { Anchor, Layers, Plane, Truck, TrainFront } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { TRANSPORT_MODES, type TransportMode } from '@/data/homeMedia';
import { useTranslation } from '@/i18n/LanguageProvider';

const ICONS: Record<TransportMode['icon'], LucideIcon> = {
  truck: Truck,
  plane: Plane,
  ship: Anchor,
  train: TrainFront,
  layers: Layers,
};

function TransportCard({ mode, className }: { mode: TransportMode; className: string }) {
  const { t } = useTranslation();
  const Icon = ICONS[mode.icon];
  return (
    <article className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-charcoal-card/70 shadow-premium transition duration-500 hover:-translate-y-1.5 hover:border-gold/50 ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <img
          src={mode.image}
          alt={t(`transport.${mode.id}.alt`)}
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-royal/95 shadow-premium ring-1 ring-gold/50">
          <Icon className="h-5 w-5 text-gold-light" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-white">{t(`transport.${mode.id}.title`)}</h3>
        <p className="mt-3 text-sm leading-relaxed text-mist">{t(`transport.${mode.id}.description`)}</p>
      </div>
    </article>
  );
}

export default function TransportationSection() {
  return (
    <section id="transport" className="relative overflow-hidden bg-navy py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Transportation"
          title="Every way to move your cargo"
          description="Road, air, sea, rail and multimodal freight, each planned around your deadline, budget and load."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {TRANSPORT_MODES.map((mode, index) => (
            <TransportCard
              key={mode.id}
              mode={mode}
              className={`${index < 3 ? 'lg:col-span-2' : 'lg:col-span-3'} ${index === TRANSPORT_MODES.length - 1 ? 'sm:col-span-2' : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
