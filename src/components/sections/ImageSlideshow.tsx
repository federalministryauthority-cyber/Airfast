import { SLIDESHOW_PHOTOS } from '@/data/homeMedia';

export default function ImageSlideshow() {
  return (
    <section aria-label="Photo highlights" className="relative overflow-hidden border-y border-gold/20 bg-navy py-8 sm:py-10">
      <div className="slideshow-track overflow-hidden">
        <div className="animate-slide-right flex w-max">
          {[0, 1].map((set) => (
            <div key={set} className="flex shrink-0" aria-hidden={set === 1 || undefined}>
              {SLIDESHOW_PHOTOS.map((photo) => (
                <figure
                  key={`${set}-${photo.src}`}
                  className="mr-5 h-44 w-64 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-premium sm:mr-6 sm:h-56 sm:w-80 lg:h-64 lg:w-96"
                >
                  <img
                    src={photo.src}
                    alt={set === 0 ? photo.alt : ''}
                    width={960}
                    height={640}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-navy to-transparent sm:w-28" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-navy to-transparent sm:w-28" aria-hidden="true" />
    </section>
  );
}
