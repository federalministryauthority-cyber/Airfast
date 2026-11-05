import { ArrowRight, ClipboardCheck, Headset, MessagesSquare } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { SUPPORT_PHOTOS } from '@/data/homeMedia';
import { COMPANY_EMAIL } from '@/data/siteContent';
import { useTranslation } from '@/i18n/LanguageProvider';

const HIGHLIGHTS = [
  { title: 'Personal answers', description: 'Questions about tracking, quotes and collections are answered by a real person.', icon: MessagesSquare },
  { title: 'Clear paperwork', description: 'We explain documents and border requirements in plain language before dispatch.', icon: ClipboardCheck },
  { title: 'Direct contact', description: 'Send your questions by email and our team will get back to you promptly.', icon: Headset },
];

export default function CustomerSupportSection() {
  const { t } = useTranslation();
  return (
    <section id="support" className="relative overflow-hidden bg-navy py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-royal/20 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Customer Support"
            title="Our Customer Support Team"
            description="Friendly, knowledgeable advisors help you before, during and after every shipment, from your first quote to final delivery."
          />

          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-royal/40 ring-1 ring-gold/40">
                  <Icon className="h-5 w-5 text-gold-light" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#contact" className="btn-primary">
              Contact our team
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={`mailto:${COMPANY_EMAIL}`} className="btn-secondary">
              {COMPANY_EMAIL}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          <figure className="col-span-2 overflow-hidden rounded-2xl border border-white/10 shadow-premium">
            <img
              src={SUPPORT_PHOTOS.featured.src}
              alt={t(SUPPORT_PHOTOS.featured.altKey)}
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover transition duration-700 hover:scale-105"
            />
          </figure>
          <figure className="overflow-hidden rounded-2xl border border-white/10 shadow-premium">
            <img
              src={SUPPORT_PHOTOS.secondary.src}
              alt={t(SUPPORT_PHOTOS.secondary.altKey)}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full object-cover transition duration-700 hover:scale-105"
            />
          </figure>
          <figure className="overflow-hidden rounded-2xl border border-white/10 shadow-premium">
            <img
              src={SUPPORT_PHOTOS.tertiary.src}
              alt={t(SUPPORT_PHOTOS.tertiary.altKey)}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full object-cover transition duration-700 hover:scale-105"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
