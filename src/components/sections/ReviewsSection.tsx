import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Quote, Send, Star } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import FormField from '@/components/ui/FormField';
import { fetchApprovedReviews, submitReview, type ReviewInput } from '@/services/enquiryService';
import { isFilled } from '@/lib/validation';
import { formatDate } from '@/lib/format';
import type { ReviewRecord } from '@/types/logistics';

const EMPTY_REVIEW: ReviewInput = { customer_name: '', customer_country: '', rating: 5, comment: '' };

function StarRating({ value, interactive = false, onChange }: { value: number; interactive?: boolean; onChange?: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1" role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = (
          <Star className={`h-5 w-5 ${filled ? 'fill-gold text-gold' : 'text-white/25'}`} aria-hidden="true" />
        );
        if (!interactive) return <span key={star}>{icon}</span>;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange?.(star)}
            className="rounded transition hover:scale-110"
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRecord }) {
  return (
    <article className="card-surface flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/40">
      <Quote className="h-8 w-8 text-gold/70" aria-hidden="true" />
      <p className="mt-4 flex-1 text-sm leading-relaxed text-white/90">{review.comment}</p>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="font-bold text-white">{review.customer_name}</p>
          <p className="text-xs text-mist">
            {[review.customer_country, formatDate(review.created_at)].filter(Boolean).join(' · ')}
          </p>
        </div>
        <StarRating value={review.rating} />
      </div>
    </article>
  );
}

function ReviewSubmitForm() {
  const [form, setForm] = useState<ReviewInput>(EMPTY_REVIEW);
  const [errors, setErrors] = useState<Partial<Record<'customer_name' | 'comment', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!isFilled(form.customer_name, 2, 120)) nextErrors.customer_name = 'Please enter your name.';
    if (!isFilled(form.comment, 10, 1000)) nextErrors.comment = 'Please write between 10 and 1000 characters.';
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await submitReview({
        customer_name: form.customer_name.trim(),
        customer_country: form.customer_country.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY_REVIEW);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your review could not be sent.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div role="status" className="card-surface flex flex-col items-center p-8 text-center animate-fade-up">
        <CheckCircle2 className="h-10 w-10 text-success-light" aria-hidden="true" />
        <p className="mt-4 font-semibold text-white">Thank you for your review.</p>
        <p className="mt-2 text-sm text-mist">It will appear here after our team has checked it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface grid gap-5 p-6 sm:p-8">
      <h3 className="text-lg font-bold text-white">Share your experience</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="review-name" label="Your Name" required error={errors.customer_name}>
          <input id="review-name" className="field-input" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} aria-invalid={!!errors.customer_name} />
        </FormField>
        <FormField id="review-country" label="Country">
          <input id="review-country" className="field-input" value={form.customer_country} onChange={(e) => setForm({ ...form, customer_country: e.target.value })} />
        </FormField>
      </div>
      <div>
        <span className="field-label">Rating</span>
        <StarRating value={form.rating} interactive onChange={(rating) => setForm({ ...form, rating })} />
      </div>
      <FormField id="review-comment" label="Your Review" required error={errors.comment}>
        <textarea id="review-comment" rows={4} className="field-input" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} aria-invalid={!!errors.comment} />
      </FormField>
      {submitError && (
        <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{submitError}</p>
      )}
      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {submitting ? 'Sending...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewRecord[] | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    fetchApprovedReviews()
      .then((data) => active && setReviews(data))
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Reviews could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="reviews" className="bg-navy py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Customer Reviews"
          title="What our customers say"
          description="Reviews appear here once they have been checked by our team."
        />

        <div className="mt-14">
          {loadError && (
            <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-center text-sm text-danger-light">{loadError}</p>
          )}
          {!loadError && reviews === null && (
            <div className="flex items-center justify-center gap-3 py-12 text-mist">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading reviews...
            </div>
          )}
          {reviews !== null && reviews.length === 0 && (
            <div className="card-surface p-10 text-center">
              <p className="font-semibold text-white">No published reviews yet.</p>
              <p className="mt-2 text-sm text-mist">Be among the first to share your experience with us.</p>
            </div>
          )}
          {reviews && reviews.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <ReviewSubmitForm />
        </div>
      </div>
    </section>
  );
}
