import { ClipboardCheck, PackageCheck, ShieldCheck, Users } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { WAREHOUSE_STEPS } from '@/data/homeMedia';
import { useTranslation } from '@/i18n/LanguageProvider';

const VALUES = [
  { title: 'Reliable handling', icon: ShieldCheck },
  { title: 'Teamwork at every step', icon: Users },
  { title: 'Checked and documented', icon: ClipboardCheck },
  { title: 'Ready for international routes', icon: PackageCheck },
];

export default function WarehouseTeamSection() {
  const { t } = useTranslation();
  return (
    <section id="warehouse" className="relative overflow-hidden bg-charcoal-dark py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Warehouse and Loading Team"
          title="Careful hands from warehouse floor to vehicle"
          description="Our loading and warehouse team load, scan, sort and prepare every consignment so it leaves on time and arrives in the condition it was collected."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WAREHOUSE_STEPS.map((step, index) => (
            <figure key={step.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-charcoal-card shadow-premium">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={step.src}
                  alt={t(`warehouse.step.${step.id}.alt`)}
                  width={960}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/85 to-transparent p-5 pt-16">
                <p className="text-xs font-bold tracking-[0.2em] text-gold">{String(index + 1).padStart(2, '0')}</p>
                <figcaption className="mt-2 text-lg font-bold text-white">{t(`warehouse.step.${step.id}.title`)}</figcaption>
                <p className="mt-2 text-sm leading-relaxed text-mist">{t(`warehouse.step.${step.id}.description`)}</p>
              </div>
            </figure>
          ))}
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ title, icon: Icon }) => (
            <li key={title} className="flex items-center gap-4 rounded-xl border border-white/10 bg-navy/60 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-royal/40 ring-1 ring-gold/40">
                <Icon className="h-5 w-5 text-gold-light" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-white">{title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
