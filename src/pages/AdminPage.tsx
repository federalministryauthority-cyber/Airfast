import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getAdminSession, isCurrentUserAdmin, signOutAdmin } from '@/services/adminService';
import AdminLogin from '@/dashboard/AdminLogin';
import AdminShell from '@/dashboard/AdminShell';
import { Loader2, ShieldAlert } from 'lucide-react';

type GateState =
  | { status: 'loading' }
  | { status: 'signed_out' }
  | { status: 'denied'; email: string }
  | { status: 'admin'; email: string }
  | { status: 'error'; message: string };

async function resolveGate(session: Session | null): Promise<GateState> {
  if (!session) return { status: 'signed_out' };
  const email = session.user.email ?? '';
  try {
    const admin = await isCurrentUserAdmin(session.user.id);
    return admin ? { status: 'admin', email } : { status: 'denied', email };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Access could not be checked.' };
  }
}

export default function AdminPage() {
  const [gate, setGate] = useState<GateState>({ status: 'loading' });

  useEffect(() => {
    document.title = 'Administrator Dashboard | Airfastsiuntos-i-anglija';
    let active = true;

    const apply = (session: Session | null) => {
      (async () => {
        const next = await resolveGate(session);
        if (active) setGate(next);
      })();
    };

    getAdminSession()
      .then(apply)
      .catch((error: unknown) => {
        if (active) setGate({ status: 'error', message: error instanceof Error ? error.message : 'Session error.' });
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => apply(session));

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (gate.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-mist">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" aria-hidden="true" /> Checking access...
      </div>
    );
  }

  if (gate.status === 'signed_out') {
    return <AdminLogin />;
  }

  if (gate.status === 'admin') {
    return <AdminShell email={gate.email} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-6">
      <div className="card-surface max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-danger-light" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold text-white">
          {gate.status === 'denied' ? 'This account does not have administrator access.' : 'Access could not be verified.'}
        </h1>
        <p className="mt-3 text-sm text-mist">
          {gate.status === 'denied'
            ? 'Please sign in with an administrator account.'
            : gate.message}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" className="btn-primary" onClick={() => void signOutAdmin()}>
            Sign out
          </button>
          <a href="/" className="btn-secondary">
            Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
