import { useEffect, useState } from 'react';
import { Loader2, Mail, Phone, Save } from 'lucide-react';
import Modal from '@/dashboard/Modal';
import { fetchQuoteRequests, updateQuoteRequest } from '@/services/adminService';
import { formatDateTime } from '@/lib/format';
import { QUOTE_STATUSES, SHIPPING_METHODS, type QuoteRequestRecord, type QuoteStatus } from '@/types/logistics';
import { SHIPMENT_CATEGORY_OPTIONS, findOptionLabel } from '@/data/shipmentOptions';
import { formatContents } from '@/data/shipmentContents';

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  quoted: 'Quoted',
  closed: 'Closed',
};

function QuoteDetailModal({
  quote,
  onClose,
  onSaved,
}: {
  quote: QuoteRequestRecord;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [response, setResponse] = useState(quote.admin_response);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const methodLabel = SHIPPING_METHODS.find((method) => method.value === quote.shipping_method)?.label ?? quote.shipping_method;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateQuoteRequest(quote.id, { status, admin_response: response.trim() });
      onSaved(`Quote request from ${quote.full_name} updated.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The quote could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const details: [string, string][] = [
    ['Email', quote.email],
    ['Phone', quote.phone],
    ['Collection', `${quote.collection_city}, ${quote.collection_country}`],
    ['Destination', `${quote.destination_city}, ${quote.destination_country}`],
    ['Shipment category', findOptionLabel(SHIPMENT_CATEGORY_OPTIONS, quote.shipment_type) ?? quote.shipment_type],
    ['Parcel contents', formatContents(quote.parcel_contents) ?? 'Not recorded'],
    ['Weight', quote.package_weight],
    ['Dimensions', quote.package_dimensions],
    ['Preferred method', methodLabel],
    ['Received', formatDateTime(quote.created_at)],
  ];

  return (
    <Modal title={`Quote request: ${quote.full_name}`} onClose={onClose} wide>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-navy/60 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-mist">{label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-white">{value}</dd>
            </div>
          ))}
          <div className="rounded-xl border border-white/10 bg-navy/60 p-4 sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wider text-mist">Additional information</dt>
            <dd className="mt-1 whitespace-pre-line break-words text-sm text-white/90">{quote.additional_info || 'None provided.'}</dd>
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <a href={`mailto:${quote.email}`} className="btn-secondary !px-4 !py-2 text-xs"><Mail className="h-4 w-4" aria-hidden="true" />Email customer</a>
            <a href={`tel:${quote.phone.replace(/\s/g, '')}`} className="btn-secondary !px-4 !py-2 text-xs"><Phone className="h-4 w-4" aria-hidden="true" />Call</a>
          </div>
        </dl>

        <div className="space-y-5">
          <div>
            <label htmlFor="quote-status" className="field-label">Enquiry status</label>
            <select id="quote-status" className="field-input" value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
              {QUOTE_STATUSES.map((value) => (
                <option key={value} value={value} className="bg-navy">{QUOTE_STATUS_LABELS[value]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quote-response" className="field-label">Your response to the customer</label>
            <textarea id="quote-response" rows={8} className="field-input" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Write the quotation or reply here. Send it to the customer by email." />
          </div>
          {error && <p role="alert" className="text-sm text-danger-light">{error}</p>}
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

const STATUS_CHIP: Record<QuoteStatus, string> = {
  new: 'bg-gold/20 text-gold-light',
  in_progress: 'bg-royal/30 text-royal-300',
  quoted: 'bg-success/25 text-success-light',
  closed: 'bg-white/10 text-mist',
};

export default function QuotesPanel() {
  const [quotes, setQuotes] = useState<QuoteRequestRecord[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<QuoteRequestRecord | null>(null);

  const load = async () => {
    try {
      setQuotes(await fetchQuoteRequests());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quote requests could not be loaded.');
    }
  };

  useEffect(() => {
    let active = true;
    fetchQuoteRequests()
      .then((data) => active && setQuotes(data))
      .catch((err: unknown) => active && setError(err instanceof Error ? err.message : 'Quote requests could not be loaded.'));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Quote Requests</h1>
        <p className="mt-2 text-sm text-mist">Review enquiries, update their progress and record your response.</p>
      </div>

      {notice && <p role="status" className="rounded-xl border border-success/50 bg-success/10 p-4 text-sm text-success-light">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{error}</p>}
      {!quotes && !error && (
        <div className="flex items-center gap-3 py-12 text-mist"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading requests...</div>
      )}
      {quotes && quotes.length === 0 && (
        <div className="card-surface p-10 text-center"><p className="font-semibold text-white">No quotation requests yet.</p></div>
      )}

      {quotes && quotes.length > 0 && (
        <ul className="grid gap-4">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <button
                type="button"
                onClick={() => setSelected(quote)}
                className="card-surface flex w-full flex-col gap-3 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-gold/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-bold text-white">{quote.full_name}</p>
                  <p className="mt-1 truncate text-sm text-mist">
                    {quote.collection_city} to {quote.destination_city} · {SHIPPING_METHODS.find((m) => m.value === quote.shipping_method)?.label}
                  </p>
                  <p className="mt-1 text-xs text-mist/80">{formatDateTime(quote.created_at)}</p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${STATUS_CHIP[quote.status]}`}>
                  {QUOTE_STATUS_LABELS[quote.status]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <QuoteDetailModal
          quote={selected}
          onClose={() => setSelected(null)}
          onSaved={(message) => {
            setNotice(message);
            void load();
          }}
        />
      )}
    </div>
  );
}
