import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/dashboard/Modal';
import FormField from '@/components/ui/FormField';
import { createShipment, updateShipment, type ShipmentInput } from '@/services/adminService';
import { fetchAllFees, fetchAllPayments, saveShipmentFees } from '@/services/paymentService';
import PaymentFeeFields from '@/dashboard/PaymentFeeFields';
import ShipmentPaymentMethodField from '@/dashboard/ShipmentPaymentMethodField';
import ShipmentPaymentStatusField from '@/dashboard/ShipmentPaymentStatusField';
import {
  emptyFeeForm,
  sumFeeAmounts,
  toFeeAmounts,
  toFeeForm,
  validateFeeForm,
  type FeeForm,
} from '@/dashboard/shipmentFeeForm';
import ShipmentDetailFields from '@/dashboard/ShipmentDetailFields';
import {
  toShipmentDetailForm,
  toShipmentDetails,
  validateShipmentDetails,
  type ShipmentDetailForm,
} from '@/dashboard/shipmentDetailForm';
import SenderFields from '@/dashboard/SenderFields';
import { toSenderFields, toSenderForm, validateSender, type SenderForm } from '@/dashboard/senderForm';
import RecipientFields from '@/dashboard/RecipientFields';
import { toRecipientFields, toRecipientForm, validateRecipient, type RecipientForm } from '@/dashboard/recipientForm';
import ShipmentHandlingFields from '@/dashboard/ShipmentHandlingFields';
import {
  toShipmentHandling,
  toShipmentHandlingForm,
  validateShipmentHandling,
  type ShipmentHandlingForm,
} from '@/dashboard/shipmentHandlingForm';
import {
  SHIPMENT_STATUSES,
  type PaymentMethod,
  type ShipmentDetails,
  type ShipmentHandling,
  type ShipmentRecipient,
  type ShipmentRecord,
  type ShipmentSender,
  type ShipmentPaymentStatus,
  type ShipmentStatus,
} from '@/types/logistics';
import { calculatePaymentSummary, type FeeCategory } from '@/lib/payments';
import { STATUS_LABELS, toDateInputValue } from '@/lib/format';
import { isFilled, isValidEmail } from '@/lib/validation';

interface ShipmentFormModalProps {
  shipment: ShipmentRecord | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

type FormState = Omit<ShipmentInput, 'estimated_delivery' | 'registered_date' | 'destination_country' | 'destination_city' | 'payment_method' | 'payment_method_other' | 'payment_status' | keyof ShipmentDetails | keyof ShipmentHandling | keyof ShipmentSender | keyof ShipmentRecipient> & { estimated_delivery: string; registered_date: string };
type FormErrors = Partial<Record<keyof FormState | keyof ShipmentDetailForm | keyof ShipmentHandlingForm | keyof SenderForm | keyof RecipientForm | FeeCategory | 'payment_method_other' | 'payment_status', string>>;

function toFormState(shipment: ShipmentRecord | null): FormState {
  return {
    customer_name: shipment?.customer_name ?? '',
    customer_email: shipment?.customer_email ?? '',
    status: shipment?.status ?? 'received',
    origin_country: shipment?.origin_country ?? '',
    origin_city: shipment?.origin_city ?? '',
    current_location: shipment?.current_location ?? '',
    estimated_delivery: toDateInputValue(shipment?.estimated_delivery ?? null),
    registered_date: toDateInputValue(shipment?.registered_date ?? null),
  };
}

function validatePaymentMethod(method: PaymentMethod | '', methodOther: string): FormErrors {
  if (method === 'other' && !isFilled(methodOther, 1, 60)) return { payment_method_other: 'Please type the payment method (up to 60 characters).' };
  return {};
}

function validatePaymentStatus(status: ShipmentPaymentStatus | ''): FormErrors {
  if (status === '') return { payment_status: 'Please choose the payment status.' };
  return {};
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!isFilled(form.customer_name, 2, 120)) errors.customer_name = 'Please enter the customer name.';
  if (form.customer_email && !isValidEmail(form.customer_email.trim())) errors.customer_email = 'Please enter a valid email address.';
  if (!isFilled(form.origin_country, 2, 80)) errors.origin_country = 'Required.';
  if (!isFilled(form.origin_city, 2, 80)) errors.origin_city = 'Required.';
  if (form.current_location.length > 160) errors.current_location = 'Please keep this under 160 characters.';
  return errors;
}

const inputClass = 'field-input';

export default function ShipmentFormModal({ shipment, onClose, onSaved }: ShipmentFormModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(shipment));
  const [details, setDetails] = useState<ShipmentDetailForm>(() => toShipmentDetailForm(shipment));
  const [handling, setHandling] = useState<ShipmentHandlingForm>(() => toShipmentHandlingForm(shipment));
  const [sender, setSender] = useState<SenderForm>(() => toSenderForm(shipment));
  const [recipient, setRecipient] = useState<RecipientForm>(() => toRecipientForm(shipment));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(() => shipment?.payment_method ?? '');
  const [paymentMethodOther, setPaymentMethodOther] = useState(() => shipment?.payment_method_other ?? '');
  const [paymentStatus, setPaymentStatus] = useState<ShipmentPaymentStatus | ''>('');
  const [feeForm, setFeeForm] = useState<FeeForm>(emptyFeeForm);
  const [amountPaid, setAmountPaid] = useState<number | null>(null);
  const [feesReady, setFeesReady] = useState(shipment === null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const isEdit = shipment !== null;
  const shipmentId = shipment?.id;

  useEffect(() => {
    if (!shipmentId) return;
    const loadFees = async () => {
      try {
        const [allFees, allPayments] = await Promise.all([fetchAllFees(), fetchAllPayments()]);
        const fees = allFees.filter((fee) => fee.shipment_id === shipmentId);
        const payments = allPayments.filter((entry) => entry.shipment_id === shipmentId);
        setFeeForm(toFeeForm(fees));
        setAmountPaid(calculatePaymentSummary(fees, payments).net);
        setFeesReady(true);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Fees could not be loaded. Close and reopen this shipment.');
      }
    };
    void loadFees();
  }, [shipmentId]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setDetailField = <K extends keyof ShipmentDetailForm>(key: K, value: ShipmentDetailForm[K]) =>
    setDetails((current) => ({ ...current, [key]: value }));

  const setHandlingField = <K extends keyof ShipmentHandlingForm>(key: K, value: ShipmentHandlingForm[K]) =>
    setHandling((current) => ({ ...current, [key]: value }));

  const setSenderField = <K extends keyof SenderForm>(key: K, value: SenderForm[K]) =>
    setSender((current) => ({ ...current, [key]: value }));

  const setRecipientField = <K extends keyof RecipientForm>(key: K, value: RecipientForm[K]) =>
    setRecipient((current) => ({ ...current, [key]: value }));

  const setFeeField = (category: FeeCategory, value: string) =>
    setFeeForm((current) => ({ ...current, [category]: value }));

  const feeAmounts = toFeeAmounts(feeForm);
  const feeTotal = sumFeeAmounts(feeAmounts);
  const outstanding = amountPaid === null ? null : Math.round((feeTotal - amountPaid) * 100) / 100;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feesReady) return;
    const nextErrors: FormErrors = {
      ...validate(form),
      ...validateShipmentDetails(details),
      ...validateShipmentHandling(handling, form.status),
      ...validateSender(sender),
      ...validateRecipient(recipient),
      ...validateFeeForm(feeForm),
      ...validatePaymentMethod(paymentMethod, paymentMethodOther),
      ...(shipment === null ? validatePaymentStatus(paymentStatus) : {}),
    };
    setErrors(nextErrors);
    setSaveError('');
    if (Object.keys(nextErrors).length > 0) return;

    const payload: ShipmentInput = {
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      status: form.status,
      origin_country: form.origin_country.trim(),
      origin_city: form.origin_city.trim(),
      current_location: form.current_location.trim(),
      estimated_delivery: form.estimated_delivery || null,
      registered_date: form.registered_date || null,
      payment_method: paymentMethod === '' ? null : paymentMethod,
      payment_method_other: paymentMethod === 'other' ? paymentMethodOther.trim() : null,
      ...toShipmentDetails(details),
      ...toShipmentHandling(handling, form.status),
      ...toSenderFields(sender),
      ...toRecipientFields(recipient),
    };

    setSaving(true);
    try {
      if (shipment) {
        await updateShipment(shipment.id, payload);
        await saveShipmentFees(shipment.id, feeAmounts);
        onSaved(`Shipment ${shipment.tracking_number} updated.`);
      } else {
        const created = await createShipment({ ...payload, payment_status: paymentStatus === '' ? null : paymentStatus });
        await saveShipmentFees(created.id, feeAmounts);
        onSaved(`Shipment created. Tracking number: ${created.tracking_number}`);
      }
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'The shipment could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? `Edit shipment ${shipment.tracking_number}` : 'Create shipment'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} noValidate className="grid gap-5 md:grid-cols-2">
        <FormField id="ship-customer" label="Customer Name" required error={errors.customer_name}>
          <input id="ship-customer" className={inputClass} value={form.customer_name} onChange={(e) => setField('customer_name', e.target.value)} />
        </FormField>
        <FormField id="ship-email" label="Customer Email" error={errors.customer_email}>
          <input id="ship-email" type="email" className={inputClass} value={form.customer_email} onChange={(e) => setField('customer_email', e.target.value)} />
        </FormField>
        <FormField id="ship-origin-country" label="Origin Country" required error={errors.origin_country}>
          <input id="ship-origin-country" className={inputClass} value={form.origin_country} onChange={(e) => setField('origin_country', e.target.value)} />
        </FormField>
        <FormField id="ship-origin-city" label="Origin City" required error={errors.origin_city}>
          <input id="ship-origin-city" className={inputClass} value={form.origin_city} onChange={(e) => setField('origin_city', e.target.value)} />
        </FormField>
        <FormField id="ship-status" label="Status" required>
          <select id="ship-status" className={inputClass} value={form.status} onChange={(e) => setField('status', e.target.value as ShipmentStatus)}>
            {SHIPMENT_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-navy">{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </FormField>
        <FormField id="ship-eta" label="Estimated Delivery">
          <input id="ship-eta" type="date" className={inputClass} value={form.estimated_delivery} onChange={(e) => setField('estimated_delivery', e.target.value)} />
        </FormField>
        <FormField id="ship-registered" label="Date Registered for Shipment">
          <input id="ship-registered" type="date" className={inputClass} value={form.registered_date} onChange={(e) => setField('registered_date', e.target.value)} />
        </FormField>
        <div className="md:col-span-2">
          <FormField id="ship-location" label="Current Location" error={errors.current_location}>
            <input id="ship-location" className={inputClass} value={form.current_location} onChange={(e) => setField('current_location', e.target.value)} />
          </FormField>
        </div>

        <SenderFields form={sender} errors={errors} onChange={setSenderField} />

        <RecipientFields form={recipient} errors={errors} onChange={setRecipientField} />

        <ShipmentDetailFields form={details} errors={errors} onChange={setDetailField} />

        <ShipmentHandlingFields status={form.status} form={handling} errors={errors} onChange={setHandlingField} />

        <ShipmentPaymentMethodField
          method={paymentMethod}
          methodOther={paymentMethodOther}
          otherError={errors.payment_method_other}
          onMethodChange={setPaymentMethod}
          onMethodOtherChange={setPaymentMethodOther}
        />

        <ShipmentPaymentStatusField
          isEdit={isEdit}
          status={shipment ? shipment.payment_status ?? '' : paymentStatus}
          error={errors.payment_status}
          onChange={setPaymentStatus}
        />

        <PaymentFeeFields
          form={feeForm}
          errors={errors}
          total={feeTotal}
          paid={amountPaid}
          outstanding={outstanding}
          onChange={setFeeField}
        />

        {saveError && (
          <p role="alert" className="md:col-span-2 rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{saveError}</p>
        )}

        <div className="md:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving || !feesReady} className="btn-primary">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isEdit ? 'Save Changes' : 'Create Shipment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
