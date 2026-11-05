import { useState } from 'react';
import { LayoutDashboard, LogOut, MessageSquare, Package, Plane, Quote, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { signOutAdmin } from '@/services/adminService';
import OverviewPanel from '@/dashboard/OverviewPanel';
import ShipmentsPanel from '@/dashboard/ShipmentsPanel';
import QuotesPanel from '@/dashboard/QuotesPanel';
import MessagesPanel from '@/dashboard/MessagesPanel';
import ReviewsPanel from '@/dashboard/ReviewsPanel';

type TabId = 'overview' | 'shipments' | 'quotes' | 'messages' | 'reviews';

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'shipments', label: 'Shipments', icon: Package },
  { id: 'quotes', label: 'Quote Requests', icon: Quote },
  { id: 'messages', label: 'Contact Messages', icon: MessageSquare },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

export default function AdminShell({ email }: { email: string }) {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen bg-navy text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-charcoal-dark/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-gradient ring-1 ring-gold/60">
              <Plane className="h-4 w-4 text-gold-light" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-extrabold">Administrator Dashboard</p>
              <p className="hidden text-xs text-mist sm:block">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="hidden text-sm font-semibold text-gold transition hover:text-gold-light sm:inline">
              View website
            </a>
            <button type="button" onClick={() => void signOutAdmin()} className="btn-secondary !px-4 !py-2 text-xs">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Dashboard sections" className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex gap-2 pb-3">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? 'bg-gold text-navy' : 'text-mist hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {tab === 'overview' && <OverviewPanel />}
        {tab === 'shipments' && <ShipmentsPanel />}
        {tab === 'quotes' && <QuotesPanel />}
        {tab === 'messages' && <MessagesPanel />}
        {tab === 'reviews' && <ReviewsPanel />}
      </main>
    </div>
  );
}
