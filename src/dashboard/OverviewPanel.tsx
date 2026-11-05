import { useEffect, useState } from 'react';
import { Loader2, Mail, Package, Quote, Star, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fetchContactMessages, fetchQuoteRequests, fetchShipments, fetchAllReviews } from '@/services/adminService';
import type { ContactMessageRecord, QuoteRequestRecord, ReviewRecord, ShipmentRecord } from '@/types/logistics';

interface Stats {
  total: number;
  inTransit: number;
  delivered: number;
  pendingEnquiries: number;
  newQuotes: number;
  pendingReviews: number;
}

function computeStats(
  shipments: ShipmentRecord[],
  quotes: QuoteRequestRecord[],
  messages: ContactMessageRecord[],
  reviews: ReviewRecord[],
): Stats {
  return {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'in_transit' || s.status === 'out_for_delivery').length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
    pendingEnquiries:
      quotes.filter((q) => q.status === 'new' || q.status === 'in_progress').length +
      messages.filter((m) => !m.is_read).length,
    newQuotes: quotes.filter((q) => q.status === 'new').length,
    pendingReviews: reviews.filter((r) => r.status === 'pending').length,
  };
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="card-surface flex items-center justify-between gap-4 p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-mist">{label}</p>
        <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
      </div>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-royal/40 ring-1 ring-royal-500/50">
        <Icon className="h-6 w-6 text-gold-light" aria-hidden="true" />
      </span>
    </div>
  );
}

export default function OverviewPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([fetchShipments(), fetchQuoteRequests(), fetchContactMessages(), fetchAllReviews()])
      .then(([shipments, quotes, messages, reviews]) => {
        if (active) setStats(computeStats(shipments, quotes, messages, reviews));
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Overview could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{error}</p>;
  }

  if (!stats) {
    return (
      <div className="flex items-center gap-3 py-16 text-mist">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading overview...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-mist">A snapshot of shipments and enquiries that need attention.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total shipments" value={stats.total} icon={Package} />
        <StatCard label="Shipments in transit" value={stats.inTransit} icon={Truck} />
        <StatCard label="Delivered shipments" value={stats.delivered} icon={Package} />
        <StatCard label="Pending enquiries" value={stats.pendingEnquiries} icon={Mail} />
        <StatCard label="New quotation requests" value={stats.newQuotes} icon={Quote} />
        <StatCard label="Reviews awaiting approval" value={stats.pendingReviews} icon={Star} />
      </div>
    </div>
  );
}
