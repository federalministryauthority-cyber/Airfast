import { useEffect, useState } from 'react';
import { Clock, Loader2, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import Modal from '@/dashboard/Modal';
import ShipmentFormModal from '@/dashboard/ShipmentFormModal';
import ShipmentEventsModal from '@/dashboard/ShipmentEventsModal';
import PaymentsModal from '@/dashboard/PaymentsModal';
import SelectField from '@/components/ui/SelectField';
import { deleteShipment, fetchShipments } from '@/services/adminService';
import { fetchAllFees, fetchAllPayments } from '@/services/paymentService';
import { calculatePaymentSummary, PAYMENT_STATUS_LABELS, PAYMENT_STATUSES, type PaymentStatus } from '@/lib/payments';
import { STATUS_LABELS, formatDate } from '@/lib/format';
import { SHIPMENT_STATUSES, type ShipmentRecord, type ShipmentStatus } from '@/types/logistics';

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; shipment: ShipmentRecord }
  | { kind: 'events'; shipment: ShipmentRecord }
  | { kind: 'payments'; shipment: ShipmentRecord }
  | { kind: 'delete'; shipment: ShipmentRecord };

interface PanelData {
  shipments: ShipmentRecord[];
  paymentStatuses: Record<string, PaymentStatus>;
}

const STATUS_BADGE: Record<ShipmentStatus, string> = {
  received: 'bg-royal/30 text-royal-300',
  processing: 'bg-royal/30 text-royal-300',
  in_transit: 'bg-royal-500/30 text-royal-300',
  arrived: 'bg-gold/20 text-gold-light',
  customs: 'bg-gold/20 text-gold-light',
  out_for_delivery: 'bg-gold/20 text-gold-light',
  delivered: 'bg-success/25 text-success-light',
  delayed: 'bg-danger/25 text-danger-light',
  on_hold: 'bg-danger/25 text-danger-light',
};

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  unpaid: 'bg-danger/25 text-danger-light',
  processing: 'bg-white/15 text-white',
  partially_paid: 'bg-gold/20 text-gold-light',
  paid: 'bg-success/25 text-success-light',
  refunded: 'bg-royal/30 text-royal-300',
};

const SHIPMENT_STATUS_FILTER = [
  { value: 'all', label: 'All shipment statuses' },
  ...SHIPMENT_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

const PAYMENT_STATUS_FILTER = [
  { value: 'all', label: 'All payment statuses' },
  ...PAYMENT_STATUSES.map((status) => ({ value: status, label: PAYMENT_STATUS_LABELS[status] })),
];

async function loadPanelData(): Promise<PanelData> {
  const [shipments, fees, payments] = await Promise.all([fetchShipments(), fetchAllFees(), fetchAllPayments()]);
  const paymentStatuses: Record<string, PaymentStatus> = {};
  for (const shipment of shipments) {
    paymentStatuses[shipment.id] = calculatePaymentSummary(
      fees.filter((fee) => fee.shipment_id === shipment.id),
      payments.filter((entry) => entry.shipment_id === shipment.id),
    ).status;
  }
  return { shipments, paymentStatuses };
}

export default function ShipmentsPanel() {
  const [shipments, setShipments] = useState<ShipmentRecord[] | null>(null);
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, PaymentStatus>>({});
  const [shipmentFilter, setShipmentFilter] = useState<'all' | ShipmentStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [deleting, setDeleting] = useState(false);

  const applyPanelData = (data: PanelData) => {
    setShipments(data.shipments);
    setPaymentStatuses(data.paymentStatuses);
    setLoadError('');
  };

  const loadShipments = async () => {
    try {
      applyPanelData(await loadPanelData());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Shipments could not be loaded.');
    }
  };

  useEffect(() => {
    let active = true;
    loadPanelData()
      .then((data) => {
        if (active) applyPanelData(data);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Shipments could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSaved = (message: string) => {
    setNotice(message);
    setActionError('');
    void loadShipments();
  };

  const confirmDelete = async (shipment: ShipmentRecord) => {
    setDeleting(true);
    setActionError('');
    try {
      await deleteShipment(shipment.id);
      setModal({ kind: 'none' });
      setNotice(`Shipment ${shipment.tracking_number} was deleted.`);
      await loadShipments();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setActionError(
        message.includes('foreign key')
          ? 'This shipment has payment records and cannot be deleted, so its payment history is kept.'
          : 'The shipment could not be deleted.',
      );
      setModal({ kind: 'none' });
    } finally {
      setDeleting(false);
    }
  };

  const visibleShipments = (shipments ?? []).filter(
    (shipment) =>
      (shipmentFilter === 'all' || shipment.status === shipmentFilter) &&
      (paymentFilter === 'all' || paymentStatuses[shipment.id] === paymentFilter),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Shipment Management</h1>
          <p className="mt-2 text-sm text-mist">Create shipments, update their status, track payments and add timeline events.</p>
        </div>
        <button type="button" onClick={() => setModal({ kind: 'create' })} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Shipment
        </button>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-success/50 bg-success/10 p-4 text-sm text-success-light">{notice}</p>
      )}
      {actionError && (
        <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{actionError}</p>
      )}
      {loadError && (
        <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{loadError}</p>
      )}

      {shipments === null && !loadError && (
        <div className="flex items-center gap-3 py-12 text-mist">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading shipments...
        </div>
      )}

      {shipments && shipments.length === 0 && (
        <div className="card-surface p-10 text-center">
          <p className="font-semibold text-white">No shipments yet.</p>
          <p className="mt-2 text-sm text-mist">Create your first shipment to generate a tracking number.</p>
        </div>
      )}

      {shipments && shipments.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField id="filter-shipment-status" label="Filter by shipment status" options={SHIPMENT_STATUS_FILTER} value={shipmentFilter} onChange={(v) => setShipmentFilter(v as 'all' | ShipmentStatus)} />
            <SelectField id="filter-payment-status" label="Filter by payment status" options={PAYMENT_STATUS_FILTER} value={paymentFilter} onChange={(v) => setPaymentFilter(v as 'all' | PaymentStatus)} />
          </div>

          {visibleShipments.length === 0 ? (
            <div className="card-surface p-10 text-center">
              <p className="font-semibold text-white">No shipments match these filters.</p>
            </div>
          ) : (
            <div className="card-surface overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-mist">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">Tracking</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Customer</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Route</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Payment</th>
                    <th scope="col" className="px-5 py-4 font-semibold">ETA</th>
                    <th scope="col" className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleShipments.map((shipment) => {
                    const paymentStatus = paymentStatuses[shipment.id] ?? 'unpaid';
                    return (
                      <tr key={shipment.id} className="transition hover:bg-white/5">
                        <td className="px-5 py-4 font-mono text-gold-light">{shipment.tracking_number}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{shipment.customer_name}</p>
                          <p className="text-xs text-mist">{shipment.customer_email || '-'}</p>
                        </td>
                        <td className="px-5 py-4 text-mist">
                          {shipment.origin_city} ({shipment.origin_country}) to {shipment.destination_city} ({shipment.destination_country})
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[shipment.status]}`}>
                            {STATUS_LABELS[shipment.status]}
                          </span>
                          {shipment.return_to_sender && <p className="mt-1 text-xs font-semibold text-gold-light">Return to sender</p>}
                          {shipment.current_location && <p className="mt-1 text-xs text-mist">{shipment.current_location}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${PAYMENT_BADGE[paymentStatus]}`}>
                            {PAYMENT_STATUS_LABELS[paymentStatus]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-mist">{formatDate(shipment.estimated_delivery)}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setModal({ kind: 'payments', shipment })} className="icon-action" aria-label={`Payments for ${shipment.tracking_number}`} title="Payments">
                              <Wallet className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => setModal({ kind: 'events', shipment })} className="icon-action" aria-label={`Timeline for ${shipment.tracking_number}`} title="Timeline">
                              <Clock className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => setModal({ kind: 'edit', shipment })} className="icon-action" aria-label={`Edit ${shipment.tracking_number}`} title="Edit">
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => setModal({ kind: 'delete', shipment })} className="icon-action hover:!border-danger hover:!text-danger-light" aria-label={`Delete ${shipment.tracking_number}`} title="Delete">
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {(modal.kind === 'create' || modal.kind === 'edit') && (
        <ShipmentFormModal
          shipment={modal.kind === 'edit' ? modal.shipment : null}
          onClose={() => setModal({ kind: 'none' })}
          onSaved={handleSaved}
        />
      )}

      {modal.kind === 'events' && (
        <ShipmentEventsModal
          shipment={modal.shipment}
          onClose={() => setModal({ kind: 'none' })}
          onChanged={(message) => {
            setNotice(message);
            void loadShipments();
          }}
        />
      )}

      {modal.kind === 'payments' && (
        <PaymentsModal
          shipment={modal.shipment}
          onClose={() => setModal({ kind: 'none' })}
          onChanged={(message) => {
            setNotice(message);
            void loadShipments();
          }}
        />
      )}

      {modal.kind === 'delete' && (
        <Modal title="Delete shipment" onClose={() => setModal({ kind: 'none' })}>
          <p className="text-sm leading-relaxed text-mist">
            This permanently deletes shipment <span className="font-mono font-bold text-white">{modal.shipment.tracking_number}</span> and its
            timeline and fees. Customers will no longer be able to track it. Shipments with payment records cannot be deleted.
          </p>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setModal({ kind: 'none' })} className="btn-secondary">Cancel</button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void confirmDelete(modal.shipment)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-danger px-6 py-3 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-60"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Delete Shipment
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
