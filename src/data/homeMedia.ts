import type { MessageKey } from '@/i18n/dictionaries';

export interface PhotoItem {
  src: string;
  alt: string;
}

export const SLIDESHOW_PHOTOS: PhotoItem[] = [
  { src: '/images/transportation/air-freight.png', alt: 'Air freight service' },
  { src: '/images/slideshow/courier-loading-van.jpg', alt: 'Courier loading parcels into a delivery van' },
  { src: '/images/transportation/sea-freight.png', alt: 'Sea freight service' },
  { src: '/images/team/support-headset-office.jpg', alt: 'Customer support specialist wearing a headset' },
  { src: '/images/warehouse/sorting-packages.jpg', alt: 'Warehouse team sorting packages' },
  { src: '/images/transportation/rail-freight.jpg', alt: 'Freight trains at a rail terminal' },
  { src: '/images/transportation/road-transport.png', alt: 'Road transport service' },
  { src: '/images/transportation/multimodal-transport.jpg', alt: 'Containers at an intermodal terminal' },
];

export const SUPPORT_PHOTOS: Record<'featured' | 'secondary' | 'tertiary', { src: string; altKey: MessageKey }> = {
  featured: { src: '/images/team/support-professional-headset.jpg', altKey: 'support.featuredAlt' },
  secondary: { src: '/images/team/support-headset-office.jpg', altKey: 'support.secondaryAlt' },
  tertiary: { src: '/images/team/support-call-centre-team.jpg', altKey: 'support.tertiaryAlt' },
};

export const WAREHOUSE_STEPS: { id: 'loading' | 'scanning' | 'handling' | 'international'; src: string }[] = [
  { id: 'loading', src: '/images/warehouse/loading-delivery-van.jpg' },
  { id: 'scanning', src: '/images/warehouse/sorting-packages.jpg' },
  { id: 'handling', src: '/images/warehouse/scanning-inventory.jpg' },
  { id: 'international', src: '/images/warehouse/logistics-hub.jpg' },
];

export interface TransportMode {
  id: 'road' | 'air' | 'sea' | 'rail' | 'multimodal';
  image: string;
  icon: 'truck' | 'plane' | 'ship' | 'train' | 'layers';
}

export const TRANSPORT_MODES: TransportMode[] = [
  { id: 'road', image: '/images/transportation/road-transport.png', icon: 'truck' },
  { id: 'air', image: '/images/transportation/air-freight.png', icon: 'plane' },
  { id: 'sea', image: '/images/transportation/sea-freight.png', icon: 'ship' },
  { id: 'rail', image: '/images/transportation/rail-freight.jpg', icon: 'train' },
  { id: 'multimodal', image: '/images/transportation/multimodal-transport.jpg', icon: 'layers' },
];
