import { useEffect, useState } from 'react';
import { Check, Loader2, Star, X } from 'lucide-react';
import { fetchAllReviews, setReviewStatus } from '@/services/adminService';
import { formatDate } from '@/lib/format';
import type { ReviewRecord, ReviewStatus } from '@/types/logistics';

const REVIEW_CHIP: Record<ReviewStatus, string> = {
  pending: 'bg-gold/20 text-gold-light',
  approved: 'bg-success/25 text-success-light',
  rejected: 'bg-danger/25 text-danger-light',
};

export default function ReviewsPanel() {
  const [reviews, setReviews] = useState<ReviewRecord[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setReviews(await fetchAllReviews());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reviews could not be loaded.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changeStatus = async (review: ReviewRecord, status: ReviewStatus) => {
    setBusyId(review.id);
    setError('');
    try {
      await setReviewStatus(review.id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The review could not be updated.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Customer Reviews</h1>
        <p className="mt-2 text-sm text-mist">Only approved reviews are shown on the website.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{error}</p>}
      {!reviews && !error && (
        <div className="flex items-center gap-3 py-12 text-mist"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading reviews...</div>
      )}
      {reviews && reviews.length === 0 && (
        <div className="card-surface p-10 text-center"><p className="font-semibold text-white">No reviews have been submitted yet.</p></div>
      )}

      {reviews && reviews.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id} className="card-surface flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-white">{review.customer_name}</p>
                  <p className="text-xs text-mist">{[review.customer_country, formatDate(review.created_at)].filter(Boolean).join(' · ')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${REVIEW_CHIP[review.status]}`}>{review.status}</span>
              </div>
              <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-gold text-gold' : 'text-white/25'}`} aria-hidden="true" />
                ))}
              </div>
              <p className="flex-1 whitespace-pre-line break-words text-sm leading-relaxed text-white/90">{review.comment}</p>
              <div className="flex gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  disabled={busyId === review.id || review.status === 'approved'}
                  onClick={() => void changeStatus(review, 'approved')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-success px-4 py-2 text-xs font-semibold text-white transition hover:bg-success/90 disabled:opacity-40"
                >
                  <Check className="h-4 w-4" aria-hidden="true" /> Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === review.id || review.status === 'rejected'}
                  onClick={() => void changeStatus(review, 'rejected')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-danger/60 px-4 py-2 text-xs font-semibold text-danger-light transition hover:bg-danger/15 disabled:opacity-40"
                >
                  <X className="h-4 w-4" aria-hidden="true" /> Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
