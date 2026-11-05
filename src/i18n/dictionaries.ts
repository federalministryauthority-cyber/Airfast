import type { LanguageCode } from '@/i18n/languages';
import { englishMessages, type MessageKey } from '@/i18n/locales/en';

export { englishMessages, type MessageKey };

export const dictionaries: Record<LanguageCode, Partial<Record<MessageKey, string>>> = {
  en: englishMessages,
  fr: {},
  fi: {},
  de: {},
  sv: {},
  pl: {},
  lt: {},
  et: {},
  es: {},
  nl: {},
  it: {},
};
