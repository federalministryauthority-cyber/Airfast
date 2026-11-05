import { Eye, Gem, Target, Handshake, Globe2, Heart, Route, Shield, MessageSquare, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { ABOUT_IMAGE, CORE_VALUE_KEYS, WHY_CHOOSE_US } from '@/data/siteContent';
import { useTranslation } from '@/i18n/LanguageProvider';

const WHY_ICONS: Record<string, LucideIcon> = {
  globe: Globe2,
  heart: Heart,
  route: Route,
  sliders: SlidersHorizontal,
  message: MessageSquare,
  shield: Shield,
};

const VALUE_ICONS: LucideIcon[] = [Eye, Gem, Handshake, Target];

export default function AboutSection() {
  const { t } = useTranslation();
  return (
    <section id="about" className="bg-charcoal py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-royal-gradient opacity-30 blur-2xl" aria-hidden="true" />
            <img
              src={ABOUT_IMAGE}
              alt={t('about.imageAlt')}
              width={1400}
              height={1000}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-[1.75rem] border border-gold/30 object-cover shadow-premium"
            />
          </div>

          <div>
            <SectionHeading
              align="left"
              eyebrow={t('about.eyebrow')}
              title={t('about.title')}
              description={t('about.description')}
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="card-surface p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold">{t('about.missionTitle')}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{t('about.missionBody')}</p>
              </div>
              <div className="card-surface p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gold">{t('about.visionTitle')}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{t('about.visionBody')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-gold">{t('about.coreValuesTitle')}</h3>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {CORE_VALUE_KEYS.map((valueKey, index) => {
              const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
              return (
                <li key={valueKey} className="card-surface flex flex-col gap-4 p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal/40 ring-1 ring-royal-500/50">
                    <Icon className="h-5 w-5 text-gold-light" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-white">{t(valueKey)}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-24">
          <SectionHeading
            eyebrow={t('about.whyEyebrow')}
            title={t('about.whyTitle')}
            description={t('about.whyDescription')}
          />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {WHY_CHOOSE_US.map((item) => {
              const Icon = WHY_ICONS[item.icon] ?? Globe2;
              return (
                <li key={item.titleKey} className="group rounded-2xl border border-white/10 bg-navy/60 p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-premium">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-royal-gradient shadow-premium transition group-hover:scale-110">
                    <Icon className="h-6 w-6 text-gold-light" aria-hidden="true" />
                  </span>
                  <h4 className="mt-5 text-lg font-bold text-white">{t(item.titleKey)}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{t(item.descriptionKey)}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
