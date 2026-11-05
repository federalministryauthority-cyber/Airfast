import { ArrowRight, Globe2, Headset, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { HERO_IMAGE } from '@/data/siteContent';
import type { MessageKey } from '@/i18n/dictionaries';
import { useTranslation } from '@/i18n/LanguageProvider';

const TRUST_ITEMS: { labelKey: MessageKey; icon: LucideIcon }[] = [
  { labelKey: 'hero.trust.reliable', icon: ShieldCheck },
  { labelKey: 'hero.trust.network', icon: Globe2 },
  { labelKey: 'hero.trust.support', icon: Headset },
];

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <section id="top" className="relative isolate overflow-hidden bg-navy pt-28 md:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-navy-gradient" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-96 w-96 rounded-full bg-royal/30 blur-3xl" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
            {t('hero.badge')}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('hero.titleStart')} <span className="text-gold-light">{t('hero.titleHighlight')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            {t('hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="#quote" className="btn-primary">
              {t('hero.ctaQuote')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#services" className="btn-secondary">
              {t('hero.ctaServices')}
            </a>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {TRUST_ITEMS.map(({ labelKey, icon: Icon }) => (
              <li key={labelKey} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-royal/30 ring-1 ring-royal-500/50">
                  <Icon className="h-4 w-4 text-gold-light" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold leading-snug text-white">{t(labelKey)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-royal-gradient opacity-40 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-gold/30 shadow-premium">
            <img
              src={HERO_IMAGE}
              alt={t('hero.imageAlt')}
              width={1800}
              height={1200}
              fetchPriority="high"
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/11]"
            />
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-navy/80 px-5 py-4 backdrop-blur-md">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">{t('hero.coverageLabel')}</p>
                <p className="text-sm font-bold text-white">{t('hero.coverageValue')}</p>
              </div>
              <Globe2 className="h-8 w-8 shrink-0 text-gold" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
