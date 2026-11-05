import type { MessageKey } from '@/i18n/dictionaries';

export interface ServiceItem {
  id: string;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  image: string;
  bestForKey: MessageKey;
  icon: 'plane' | 'truck' | 'ship' | 'train' | 'warehouse' | 'globe';
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'air',
    titleKey: 'service.air.title',
    descriptionKey: 'service.air.description',
    image: 'https://images.pexels.com/photos/32563016/pexels-photo-32563016.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop',
    bestForKey: 'service.air.bestFor',
    icon: 'plane',
  },
  {
    id: 'road',
    titleKey: 'service.road.title',
    descriptionKey: 'service.road.description',
    image: 'https://images.pexels.com/photos/28264496/pexels-photo-28264496.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop',
    bestForKey: 'service.road.bestFor',
    icon: 'truck',
  },
  {
    id: 'sea',
    titleKey: 'service.sea.title',
    descriptionKey: 'service.sea.description',
    image: 'https://images.pexels.com/photos/262353/pexels-photo-262353.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop',
    bestForKey: 'service.sea.bestFor',
    icon: 'ship',
  },
  {
    id: 'rail',
    titleKey: 'service.rail.title',
    descriptionKey: 'service.rail.description',
    image: 'https://images.pexels.com/photos/5742831/pexels-photo-5742831.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop',
    bestForKey: 'service.rail.bestFor',
    icon: 'train',
  },
  {
    id: 'warehousing',
    titleKey: 'service.warehousing.title',
    descriptionKey: 'service.warehousing.description',
    image: 'https://images.pexels.com/photos/4487364/pexels-photo-4487364.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop',
    bestForKey: 'service.warehousing.bestFor',
    icon: 'warehouse',
  },
  {
    id: 'global',
    titleKey: 'service.global.title',
    descriptionKey: 'service.global.description',
    image: 'https://images.pexels.com/photos/8828390/pexels-photo-8828390.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop',
    bestForKey: 'service.global.bestFor',
    icon: 'globe',
  },
];

export interface DestinationItem {
  code: string;
  name: string;
  nameKey: MessageKey;
  flagCode: string;
}

export const DESTINATIONS: DestinationItem[] = [
  { code: 'LT', name: 'Lithuania', nameKey: 'country.lt', flagCode: 'lt' },
  { code: 'AT', name: 'Austria', nameKey: 'country.at', flagCode: 'at' },
  { code: 'EE', name: 'Estonia', nameKey: 'country.ee', flagCode: 'ee' },
  { code: 'FI', name: 'Finland', nameKey: 'country.fi', flagCode: 'fi' },
  { code: 'CH', name: 'Switzerland', nameKey: 'country.ch', flagCode: 'ch' },
  { code: 'DE', name: 'Germany', nameKey: 'country.de', flagCode: 'de' },
  { code: 'NO', name: 'Norway', nameKey: 'country.no', flagCode: 'no' },
  { code: 'IT', name: 'Italy', nameKey: 'country.it', flagCode: 'it' },
  { code: 'GB', name: 'United Kingdom', nameKey: 'country.gb', flagCode: 'gb' },
  { code: 'FR', name: 'France', nameKey: 'country.fr', flagCode: 'fr' },
];

export const CORE_VALUE_KEYS: MessageKey[] = [
  'about.value.transparency',
  'about.value.punctual',
  'about.value.pricing',
  'about.value.respect',
];

export const WHY_CHOOSE_US: { titleKey: MessageKey; descriptionKey: MessageKey; icon: string }[] = [
  { titleKey: 'why.international.title', descriptionKey: 'why.international.description', icon: 'globe' },
  { titleKey: 'why.customer.title', descriptionKey: 'why.customer.description', icon: 'heart' },
  { titleKey: 'why.coordination.title', descriptionKey: 'why.coordination.description', icon: 'route' },
  { titleKey: 'why.flexible.title', descriptionKey: 'why.flexible.description', icon: 'sliders' },
  { titleKey: 'why.communication.title', descriptionKey: 'why.communication.description', icon: 'message' },
  { titleKey: 'why.reliable.title', descriptionKey: 'why.reliable.description', icon: 'shield' },
];

export const HERO_IMAGE = 'https://images.pexels.com/photos/32037884/pexels-photo-32037884.jpeg?auto=compress&cs=tinysrgb&w=1800&h=1200&fit=crop';
export const ABOUT_IMAGE = 'https://images.pexels.com/photos/20581299/pexels-photo-20581299.jpeg?auto=compress&cs=tinysrgb&w=1400&h=1000&fit=crop';

export const COMPANY_NAME = 'Airfastsiuntos-i-anglija';
export const COMPANY_EMAIL = 'info@airfastsiuntos-i-anglija.com';
