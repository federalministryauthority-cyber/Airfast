import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import Modal from '@/dashboard/Modal';
import FormField from '@/components/ui/FormField';
import {
  addShipmentEvent,
  deleteShipmentEvent,
  fetchShipmentEvents,
  updateShipment,
} from '@/services/adminService';
import { SHIPMENT_STATUSES, type ShipmentEventRecord, type ShipmentRecord, type ShipmentStatus } from '@/types/logistics';
import { STATUS_LABELS, formatDateTime } from '@/lib/format';
import { isFilled } from '@/lib/validation';

interface ShipmentEventsModalProps {
  shipment: ShipmentRecord;
  onClose: () => void;
  onChanged: (message: string) => void;
}

function toLocalInputValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function ShipmentEventsModal({ shipment, onClose, onChanged }: ShipmentEventsModalProps) {
  const [events, setEvents] = useState<ShipmentEventRecord[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status);
  const [location, setLocation] = useState(shipment.current_location);
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState(() => toLocalInputValue(new Date()));
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setEvents(await fetchShipmentEvents(shipment.id));
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Timeline could not be loaded.');
    }
  };

  useEffect(() => {
    let active = true;
    fetchShipmentEvents(shipment.id)
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Timeline could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, [shipment.id]);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFilled(description, 2, 500)) {
      setFormError('Please describe the update (2 to 500 characters).');
      return;
    }
    const parsedTime = new Date(eventTime);
    if (Number.isNaN(parsedTime.getTime())) {
      setFormError('Please choose a valid date and time.');
      return;
    }

    setFormError('');
    setSaving(true);
    try {
      await addShipmentEvent({
        shipment_id: shipment.id,
        event_time: parsedTime.toISOString(),
        status,
        location: location.trim(),
        description: description.trim(),
      });
      await updateShipment(shipment.id, { status, current_location: location.trim() });
      setDescription('');
      await loadEvents();
      onChanged(`Timeline updated for ${shipment.tracking_number}.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The update could not be added.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setLoadError('');
    try {
      await deleteShipmentEvent(id);
      await loadEvents();
      onChanged(`Timeline entry removed for ${shipment.tracking_number}.`);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'The entry could not be removed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal title={`Timeline: ${shipment.tracking_number}`} onClose={onClose} wide>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={handleAdd} noValidate className="space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Add tracking update</h3>
          <FormField id="event-status" label="Status">
            <select id="event-status" className="field-input" value={status} onChange={(e) => setStatus(e.target.value as ShipmentStatus)}>
              {SHIPMENT_STATUSES.map((value) => (
                <option key={value} value={value} className="bg-navy">{STATUS_LABELS[value]}</option>
              ))}
            </select>
          </FormField>
          <FormField id="event-location" label="Location">
            <input id="event-location" className="field-input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormField>
          <FormField id="event-time" label="Date and time">
            <input id="event-time" type="datetime-local" className="field-input" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          </FormField>
          <FormField id="event-description" label="Description" required error={formError || undefined}>
            <textarea id="event-description" rows={3} className="field-input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            Add Update
          </button>
        </form>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold">Existing updates</h3>
          {loadError && <p role="alert" className="mt-4 text-sm text-danger-light">{loadError}</p>}
          {!events && !loadError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-mist">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading...
            </div>
          )}
          {events && events.length === 0 && <p className="mt-4 text-sm text-mist">No updates yet.</p>}
          {events && events.length > 0 && (
            <ul className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {events.map((item) => (
                <li key={item.id} className="rounded-xl border border-white/10 bg-navy/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{STATUS_LABELS[item.status]}</p>
                      <p className="text-xs text-mist">{formatDateTime(item.event_time)}</p>
                      {item.location && <p className="mt-1 text-xs text-mist">{item.location}</p>}
                      <p className="mt-2 text-sm text-white/90">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Remove update"
                      className="icon-action shrink-0 hover:!border-danger hover:!text-danger-light"
                    >
                      {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
