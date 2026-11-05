import { useCallback, useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import Modal from '@/dashboard/Modal';
import PaymentFeesTab from '@/dashboard/PaymentFeesTab';
import PaymentRecordsTab from '@/dashboard/PaymentRecordsTab';
import { fetchAllFees, fetchAllPayments } from '@/services/paymentService';
import { calculatePaymentSummary, formatMoney, PAYMENT_STATUS_LABELS, type PaymentStatus } from '@/lib/payments';
import { openPaymentDocument } from '@/lib/paymentDocument';
import type { ShipmentFee, ShipmentPayment, ShipmentRecord } from '@/types/logistics';

interface PaymentsModalProps {
  shipment: ShipmentRecord;
  onClose: () => void;
  onChanged: (message: string) => void;
}

type Tab = 'fees' | 'payments';

const STATUS_BADGE: Record<PaymentStatus, string> = {
  unpaid: 'bg-danger/25 text-danger-light',
  processing: 'bg-white/15 text-white',
  partially_paid: 'bg-gold/20 text-gold-light',
  paid: 'bg-success/25 text-success-light',
  refunded: 'bg-royal/30 text-royal-300',
};

export default function PaymentsModal({ shipment, onClose, onChanged }: PaymentsModalProps) {
  const [fees, setFees] = useState<ShipmentFee[] | null>(null);
  const [payments, setPayments] = useState<ShipmentPayment[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<Tab>('fees');
  const [documentError, setDocumentError] = useState('');

  const load = useCallback(async () => {
    try {
      const [allFees, allPayments] = await Promise.all([fetchAllFees(), fetchAllPayments()]);
      setFees(allFees.filter((fee) => fee.shipment_id === shipment.id));
      setPayments(allPayments.filter((entry) => entry.shipment_id === shipment.id));
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Payment details could not be loaded.');
    }
  }, [shipment.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleChanged = (message: string) => {
    onChanged(message);
    void load();
  };

  const summary = fees && payments ? calculatePaymentSummary(fees, payments) : null;

  const printDocument = (kind: 'invoice' | 'receipt', payment?: ShipmentPayment) => {
    if (!fees || !payments) return;
    setDocumentError('');
    const opened = openPaymentDocument({ kind, shipment, fees, payments, payment });
    if (!opened) setDocumentError('Your browser blocked the document window. Please allow pop-ups for this site and try again.');
  };

  return (
    <Modal title={`Payments: ${shipment.tracking_number}`} onClose={onClose} wide>
      {loadError && <p role="alert" className="mb-6 rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{loadError}</p>}
      {documentError && <p role="alert" className="mb-6 rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{documentError}</p>}

      {!summary && !loadError && (
        <div className="flex items-center gap-3 py-12 text-mist">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading payments...
        </div>
      )}

      {summary && fees && payments && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Total Shipment Cost" value={formatMoney(summary.total)} />
            <SummaryCard label="Amount Paid" value={formatMoney(summary.net)} />
            <SummaryCard label="Outstanding Balance" value={formatMoney(summary.outstanding)} />
            <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-mist">Payment status</p>
              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[summary.status]}`}>
                {PAYMENT_STATUS_LABELS[summary.status]}
              </span>
              {summary.pendingVerification > 0 && (
                <p className="mt-2 text-xs text-mist">{formatMoney(summary.pendingVerification)} awaiting verification</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="tablist" aria-label="Payment sections" className="flex gap-2">
              {(['fees', 'payments'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tab === value ? 'bg-gold text-navy' : 'text-mist hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {value === 'fees' ? 'Fees' : 'Payments and refunds'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => printDocument('invoice')} className="btn-secondary !px-5 !py-2.5">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Invoice
              </button>
            </div>
          </div>

          {tab === 'fees' ? (
            <PaymentFeesTab shipmentId={shipment.id} fees={fees} onChanged={handleChanged} />
          ) : (
            <PaymentRecordsTab
              shipmentId={shipment.id}
              payments={payments}
              onChanged={handleChanged}
              onPrintReceipt={(payment) => printDocument('receipt', payment)}
            />
          )}
        </div>
      )}
    </Modal>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-mist">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}
