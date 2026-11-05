import { useState, type FormEvent } from 'react';
import { Loader2, LogIn, Plane } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import { signInAdmin } from '@/services/adminService';
import { isValidEmail } from '@/lib/validation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!isValidEmail(email.trim())) nextErrors.email = 'Please enter a valid email address.';
    if (!password) nextErrors.password = 'Please enter your password.';
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signInAdmin(email.trim(), password);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-gradient p-6">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-royal/30 blur-3xl" aria-hidden="true" />
      <div className="card-surface relative w-full max-w-md p-8 animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal-gradient shadow-premium ring-1 ring-gold/60">
            <Plane className="h-6 w-6 text-gold-light" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-white">Administrator Sign In</h1>
          <p className="mt-2 text-sm text-mist">Restricted to authorised staff of Airfastsiuntos-i-anglija.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <FormField id="admin-email" label="Email" required error={errors.email}>
            <input id="admin-email" type="email" autoComplete="username" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
          </FormField>
          <FormField id="admin-password" label="Password" required error={errors.password}>
            <input id="admin-password" type="password" autoComplete="current-password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} />
          </FormField>

          {submitError && (
            <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{submitError}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <a href="/" className="mt-6 block text-center text-sm font-semibold text-gold transition hover:text-gold-light">
          Back to website
        </a>
      </div>
    </div>
  );
}
