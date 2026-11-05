import Logo from '@/components/layout/Logo';
import { COMPANY_EMAIL, COMPANY_NAME, DESTINATIONS, SERVICES } from '@/data/siteContent';
import { useTranslation } from '@/i18n/LanguageProvider';

export default function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="relative overflow-hidden border-t border-gold/20 bg-charcoal-dark">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-royal/20 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            Dependable international transport and logistics solutions for individuals and businesses across Europe and beyond.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gold">Quick Links</h3>
          <ul className="space-y-3 text-sm text-mist">
            <li><a className="transition hover:text-gold" href="#services">Services</a></li>
            <li><a className="transition hover:text-gold" href="#destinations">Shipping Destinations</a></li>
            <li><a className="transition hover:text-gold" href="#track">Track Shipment</a></li>
            <li><a className="transition hover:text-gold" href="#about">About Us</a></li>
            <li><a className="transition hover:text-gold" href="#contact">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gold">Shipping Services</h3>
          <ul className="space-y-3 text-sm text-mist">
            {SERVICES.map((service) => (
              <li key={service.id}>
                <a className="transition hover:text-gold" href="#services">{t(service.titleKey)}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-gold">Contact</h3>
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            className="break-all text-sm font-semibold text-white transition hover:text-gold"
          >
            {COMPANY_EMAIL}
          </a>
          <h4 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wider text-mist">Destinations</h4>
          <p className="text-sm leading-relaxed text-mist">
            {DESTINATIONS.map((destination) => t(destination.nameKey)).join(' · ')}
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-mist sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <a href="#top" className="font-semibold text-gold transition hover:text-gold-light">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
