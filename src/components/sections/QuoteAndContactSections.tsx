import { Mail } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import ContactForm from '@/components/forms/ContactForm';
import QuoteForm from '@/components/forms/QuoteForm';
import { COMPANY_EMAIL } from '@/data/siteContent';

export function QuoteSection() {
  return (
    <section id="quote" className="bg-navy py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Request a Quote"
          title="Tell us about your shipment"
          description="Share the details below and our team will come back to you with a personal quotation."
        />
        <div className="mt-14">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="bg-charcoal-dark py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <div className="space-y-8">
          <SectionHeading
            align="left"
            eyebrow="Contact"
            title="Let's talk about your next shipment"
            description="Send us a message and we will reply by email."
          />
          <div className="card-surface flex items-start gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-royal-gradient shadow-premium">
              <Mail className="h-5 w-5 text-gold-light" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gold">Company</p>
              <p className="mt-1 font-bold text-white">Airfastsiuntos-i-anglija</p>
              <p className="text-xs font-bold uppercase tracking-wider text-gold mt-4">Email</p>
              <a href={`mailto:${COMPANY_EMAIL}`} className="mt-1 break-all text-sm font-semibold text-white transition hover:text-gold">
                {COMPANY_EMAIL}
              </a>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
