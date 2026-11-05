import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import LanguageMenu from '@/components/layout/LanguageMenu';
import { useTranslation } from '@/i18n/LanguageProvider';
import type { MessageKey } from '@/i18n/dictionaries';

const NAV_LINKS: { href: string; labelKey: MessageKey }[] = [
  { href: '#top', labelKey: 'nav.home' },
  { href: '#services', labelKey: 'nav.services' },
  { href: '#destinations', labelKey: 'nav.destinations' },
  { href: '#track', labelKey: 'nav.track' },
  { href: '#about', labelKey: 'nav.about' },
  { href: '#reviews', labelKey: 'nav.reviews' },
  { href: '#contact', labelKey: 'nav.contact' },
];

export default function SiteHeader() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? 'bg-navy/95 shadow-premium backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label={t('nav.mainLabel')} className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-gold"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageMenu />
          <a href="#quote" className="btn-primary hidden !px-5 !py-2.5 md:inline-flex">
            {t('nav.requestQuote')}
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-gold hover:text-gold xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-navy transition-all duration-300 xl:hidden ${
          menuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav aria-label={t('nav.mobileLabel')} className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:text-gold"
            >
              {t(link.labelKey)}
            </a>
          ))}
          <a href="#quote" onClick={closeMenu} className="btn-primary mt-3">
            {t('nav.requestQuote')}
          </a>
        </nav>
      </div>
    </header>
  );
}
