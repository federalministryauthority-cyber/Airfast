interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <a
      href="#top"
      className={`group inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-premium ring-1 ring-gold/40 transition duration-300 hover:-translate-y-0.5 hover:ring-gold ${className}`}
      aria-label="Airfastsiuntos-i-anglija home"
    >
      <img
        src="/brand/airfast-logo.png"
        alt="Airfastsiuntos-i-anglija logo"
        width={532}
        height={125}
        className="h-10 w-auto max-w-none sm:h-12"
      />
    </a>
  );
}
