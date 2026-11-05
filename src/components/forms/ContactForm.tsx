import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import { submitContactMessage, type ContactInput } from '@/services/enquiryService';
import { isFilled, isValidEmail } from '@/lib/validation';

type ContactField = keyof ContactInput;

const EMPTY_FORM: ContactInput = { full_name: '', email: '', subject: '', message: '' };

function validate(form: ContactInput): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  if (!isFilled(form.full_name, 2, 120)) errors.full_name = 'Please enter your full name.';
  if (!isValidEmail(form.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!isFilled(form.subject, 2, 160)) errors.subject = 'Please enter a subject.';
  if (!isFilled(form.message, 2, 5000)) errors.message = 'Please enter your message.';
  return errors;
}

export default function ContactForm() {
  const [form, setForm] = useState<ContactInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: ContactField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await submitContactMessage({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your message could not be sent.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div role="status" className="card-surface flex flex-col items-center p-10 text-center animate-fade-up">
        <CheckCircle2 className="h-12 w-12 text-success-light" aria-hidden="true" />
        <h3 className="mt-6 text-2xl font-bold text-white">Message sent</h3>
        <p className="mt-3 text-sm text-mist">Thank you for contacting us. We will reply to your email address as soon as possible.</p>
        <button type="button" onClick={() => setSubmitted(false)} className="btn-secondary mt-8">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface grid gap-6 p-6 sm:p-8 md:grid-cols-2">
      <FormField id="contact-name" label="Full Name" required error={errors.full_name}>
        <input id="contact-name" className="field-input" autoComplete="name" value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} aria-invalid={!!errors.full_name} />
      </FormField>
      <FormField id="contact-email" label="Email Address" required error={errors.email}>
        <input id="contact-email" type="email" className="field-input" autoComplete="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} aria-invalid={!!errors.email} />
      </FormField>
      <div className="md:col-span-2">
        <FormField id="contact-subject" label="Subject" required error={errors.subject}>
          <input id="contact-subject" className="field-input" value={form.subject} onChange={(e) => updateField('subject', e.target.value)} aria-invalid={!!errors.subject} />
        </FormField>
      </div>
      <div className="md:col-span-2">
        <FormField id="contact-message" label="Message" required error={errors.message}>
          <textarea id="contact-message" rows={5} className="field-input" value={form.message} onChange={(e) => updateField('message', e.target.value)} aria-invalid={!!errors.message} />
        </FormField>
      </div>

      {submitError && (
        <p role="alert" className="md:col-span-2 rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">
          {submitError}
        </p>
      )}

      <div className="md:col-span-2 flex justify-end">
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
