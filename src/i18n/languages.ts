export const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'fi', label: 'Suomi', flag: 'fi' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'sv', label: 'Svenska', flag: 'se' },
  { code: 'pl', label: 'Polski', flag: 'pl' },
  { code: 'lt', label: 'Lietuvių', flag: 'lt' },
  { code: 'et', label: 'Eesti', flag: 'ee' },
  { code: 'es', label: 'Español', flag: 'es' },
  { code: 'nl', label: 'Nederlands', flag: 'nl' },
  { code: 'it', label: 'Italiano', flag: 'it' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function isLanguageCode(value: string | null): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value);
}
