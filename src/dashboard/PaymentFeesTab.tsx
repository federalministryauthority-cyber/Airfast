import { useState, type FormEvent } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SelectField from '@/components/ui/SelectField';
import { addFee, deleteFee, updateFee } from '@/services/paymentService';
import { FEE_AMOUNT_ERROR, FEE_CATEGORIES, formatMoney, parseFeeAmount } from '@/lib/payments';
import type { ShipmentFee } from '@/types/logistics';

interface PaymentFeesTabProps {
  shipmentId: string;
  fees: ShipmentFee[];
  onChanged: (message: string) => void;
}

interface FeeDraft {
  id: string;
  label: string;
  amount: string;
  error?: string;
  saving: boolean;
}

const FEE_OPTIONS = FEE_CATEGORIES.map((category) => ({ value: category, label: category }));

export default function PaymentFeesTab({ shipmentId, fees, onChanged }: PaymentFeesTabProps) {
  const [label, setLabel] = useState<string>(FEE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; save?: string }>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FeeDraft | null>(null);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseFeeAmount(amount);
    if (parsed === null) {
      setErrors({ amount: FEE_AMOUNT_ERROR });
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      await addFee({ shipment_id: shipmentId, label, amount: parsed });
      setAmount('');
      onChanged('Fee added.');
    } catch (error) {
      setErrors({ save: error instanceof Error ? error.message : 'The fee could not be added.' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (fee: ShipmentFee) => {
    setDraft({ id: fee.id, label: fee.label, amount: Number(fee.amount).toFixed(2), saving: false });
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const parsed = parseFeeAmount(draft.amount);
    if (parsed === null) {
      setDraft({ ...draft, error: FEE_AMOUNT_ERROR });
      return;
    }

    setDraft({ ...draft, error: undefined, saving: true });
    try {
      await updateFee(draft.id, { label: draft.label, amount: parsed });
      setDraft(null);
      onChanged('Fee updated.');
    } catch (error) {
      setDraft({ ...draft, saving: false, error: error instanceof Error ? error.message : 'The fee could not be updated.' });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFee(id);
      onChanged('Fee removed.');
    } catch (error) {
      setErrors({ save: error instanceof Error ? error.message : 'The fee could not be removed.' });
    } finally {
      setDeletingId(null);
    }
  };

  const total = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <form onSubmit={handleAdd} noValidate className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Add a fee</h3>
        <SelectField id="fee-label" label="Fee type" options={FEE_OPTIONS} value={label} onChange={setLabel} />
        <FormField id="fee-amount" label="Amount" required error={errors.amount}>
          <input id="fee-amount" inputMode="decimal" className="field-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </FormField>
        {errors.save && <p role="alert" className="text-sm text-danger-light">{errors.save}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          Add Fee
        </button>
      </form>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Fees on this shipment</h3>
        {fees.length === 0 ? (
          <p className="mt-4 text-sm text-mist">No fees added yet.</p>
        ) : (
          <ul className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {fees.map((fee) =>
              draft?.id === fee.id ? (
                <li key={fee.id} className="rounded-xl border border-gold/40 bg-navy/60 p-4">
                  <form onSubmit={handleSaveEdit} noValidate className="space-y-4">
                    <SelectField id="edit-fee-label" label="Fee type" options={FEE_OPTIONS} value={draft.label} onChange={(value) => setDraft({ ...draft, label: value })} />
                    <FormField id="edit-fee-amount" label="Amount" required error={draft.error}>
                      <input id="edit-fee-amount" inputMode="decimal" className="field-input" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value, error: undefined })} />
                    </FormField>
                    <div className="flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setDraft(null)} disabled={draft.saving} className="btn-secondary">
                        <X className="h-4 w-4" aria-hidden="true" />
                        Cancel
                      </button>
                      <button type="submit" disabled={draft.saving} className="btn-primary">
                        {draft.saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                        Save Fee
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li key={fee.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy/60 p-4">
                  <p className="min-w-0 truncate text-sm font-semibold text-white">{fee.label}</p>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-sm font-bold text-white">{formatMoney(Number(fee.amount))}</p>
                    <button
                      type="button"
                      onClick={() => startEdit(fee)}
                      disabled={deletingId === fee.id}
                      aria-label={`Edit fee ${fee.label}`}
                      className="icon-action"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(fee.id)}
                      disabled={deletingId === fee.id}
                      aria-label={`Remove fee ${fee.label}`}
                      className="icon-action hover:!border-danger hover:!text-danger-light"
                    >
                      {deletingId === fee.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-sm font-semibold text-mist">Total of fees</p>
          <p className="text-base font-extrabold text-white">{formatMoney(total)}</p>
        </div>
      </div>
    </div>
  );
}
