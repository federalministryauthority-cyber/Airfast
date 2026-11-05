import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { LANGUAGES, type LanguageCode } from '@/i18n/languages';
import { useTranslation } from '@/i18n/LanguageProvider';

export default function LanguageMenu() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((option) => option.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('language.label')}: ${current.label}`}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-3 text-sm font-semibold text-white transition hover:border-gold hover:text-gold"
      >
        <img
          src={`https://flagcdn.com/w40/${current.flag}.png`}
          alt=""
          width={20}
          height={14}
          className="h-3.5 w-5 rounded-sm object-cover ring-1 ring-white/30"
        />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language.choose')}
          className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-56 overflow-y-auto rounded-2xl border border-gold/30 bg-navy p-2 shadow-premium animate-fade-up"
        >
          {LANGUAGES.map((option) => {
            const selected = option.code === language;
            return (
              <li key={option.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => choose(option.code)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    selected ? 'bg-royal/40 text-gold-light' : 'text-white hover:bg-white/10 hover:text-gold'
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${option.flag}.png`}
                    alt=""
                    width={20}
                    height={14}
                    loading="lazy"
                    className="h-3.5 w-5 rounded-sm object-cover ring-1 ring-white/30"
                  />
                  <span className="flex-1">{option.label}</span>
                  {selected && <Check className="h-4 w-4 text-gold-light" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
