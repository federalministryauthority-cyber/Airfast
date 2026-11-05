import { useEffect, useState } from 'react';
import { ChevronDown, Loader2, Mail } from 'lucide-react';
import { fetchContactMessages, setContactMessageRead } from '@/services/adminService';
import { formatDateTime } from '@/lib/format';
import type { ContactMessageRecord } from '@/types/logistics';

export default function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessageRecord[] | null>(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setMessages(await fetchContactMessages());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Messages could not be loaded.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleRead = async (message: ContactMessageRecord, isRead: boolean) => {
    setBusyId(message.id);
    setError('');
    try {
      await setContactMessageRead(message.id, isRead);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The message could not be updated.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = (message: ContactMessageRecord) => {
    const nextOpen = openId === message.id ? null : message.id;
    setOpenId(nextOpen);
    if (nextOpen && !message.is_read) void toggleRead(message, true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Contact Messages</h1>
        <p className="mt-2 text-sm text-mist">Messages from the contact form. Opening a message marks it as read.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger-light">{error}</p>}
      {!messages && !error && (
        <div className="flex items-center gap-3 py-12 text-mist"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading messages...</div>
      )}
      {messages && messages.length === 0 && (
        <div className="card-surface p-10 text-center"><p className="font-semibold text-white">No messages yet.</p></div>
      )}

      {messages && messages.length > 0 && (
        <ul className="grid gap-4">
          {messages.map((message) => {
            const open = openId === message.id;
            return (
              <li key={message.id} className="card-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleToggle(message)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-white/5"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${message.is_read ? 'bg-white/20' : 'bg-gold shadow-gold'}`} aria-label={message.is_read ? 'Read' : 'Unread'} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${message.is_read ? 'font-semibold text-mist' : 'font-bold text-white'}`}>
                      {message.subject}
                    </p>
                    <p className="truncate text-xs text-mist">{message.full_name} · {formatDateTime(message.created_at)}</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-mist transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {open && (
                  <div className="border-t border-white/10 p-5">
                    <p className="whitespace-pre-line break-words text-sm leading-relaxed text-white/90">{message.message}</p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="btn-secondary !px-4 !py-2 text-xs">
                        <Mail className="h-4 w-4" aria-hidden="true" /> Reply by email
                      </a>
                      <button
                        type="button"
                        disabled={busyId === message.id}
                        onClick={() => void toggleRead(message, !message.is_read)}
                        className="text-xs font-semibold text-gold transition hover:text-gold-light disabled:opacity-60"
                      >
                        Mark as {message.is_read ? 'unread' : 'read'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
