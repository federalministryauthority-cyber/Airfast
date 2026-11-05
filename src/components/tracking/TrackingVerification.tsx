import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import type { FilterCheck } from '@/components/tracking/trackingFilters';

const STATUS_ICON = {
  match: { Icon: CheckCircle2, className: 'text-success-light', text: 'Matches' },
  mismatch: { Icon: XCircle, className: 'text-danger-light', text: 'Does not match' },
  not_recorded: { Icon: MinusCircle, className: 'text-gold-light', text: 'Not recorded' },
} as const;

export default function TrackingVerification({ checks }: { checks: FilterCheck[] }) {
  if (checks.length === 0) return null;

  const hasMismatch = checks.some((check) => check.status === 'mismatch');
  const allMatch = checks.every((check) => check.status === 'match');
  const headline = hasMismatch
    ? 'Some details you selected do not match this shipment.'
    : allMatch
      ? 'All details you selected match this shipment.'
      : 'Some details you selected are not recorded for this shipment.';

  return (
    <div className="rounded-2xl border border-white/10 bg-navy/60 p-5 sm:p-6">
      <p className={`text-sm font-bold ${hasMismatch ? 'text-danger-light' : 'text-white'}`}>{headline}</p>
      {hasMismatch && (
        <p className="mt-1 text-sm text-mist">Please check your selections or contact us if the details look wrong.</p>
      )}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {checks.map((check) => {
          const { Icon, className, text } = STATUS_ICON[check.status];
          return (
            <li key={check.label} className="flex items-center gap-3 text-sm">
              <Icon className={`h-4 w-4 shrink-0 ${className}`} aria-hidden="true" />
              <span className="text-white">{check.label}</span>
              <span className="sr-only">: {text}</span>
              <span className={`ml-auto text-xs font-semibold ${className}`} aria-hidden="true">{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
