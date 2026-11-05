import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import HeroSection from '@/components/sections/HeroSection';
import ImageSlideshow from '@/components/sections/ImageSlideshow';
import ServicesSection from '@/components/sections/ServicesSection';
import TransportationSection from '@/components/sections/TransportationSection';
import WarehouseTeamSection from '@/components/sections/WarehouseTeamSection';
import DestinationsSection from '@/components/sections/DestinationsSection';
import TrackingSection from '@/components/tracking/TrackingSection';
import AboutSection from '@/components/sections/AboutSection';
import CustomerSupportSection from '@/components/sections/CustomerSupportSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import { ContactSection, QuoteSection } from '@/components/sections/QuoteAndContactSections';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy">
      <SiteHeader />
      <main>
        <HeroSection />
        <ImageSlideshow />
        <ServicesSection />
        <TransportationSection />
        <WarehouseTeamSection />
        <DestinationsSection />
        <TrackingSection />
        <AboutSection />
        <CustomerSupportSection />
        <ReviewsSection />
        <QuoteSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
