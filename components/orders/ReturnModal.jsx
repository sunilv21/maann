'use client';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import { authFetch } from '@/lib/authFetch';

const REASONS = [
  'Wrong size / fit',
  'Product not as described',
  'Damaged or defective item',
  'Changed my mind',
  'Received wrong item',
  'Quality not as expected',
  'Other',
];

export default function ReturnModal() {
  const { activeModal, modalData, closeModal } = useModal();
  const { showToast } = useToast();
  const [type, setType] = useState('return');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOpen = activeModal === 'return';
  const order = modalData?.order;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { showToast('Please select a reason', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/orders/${order?.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, reason, details }),
      });
      const d = await res.json();
      if (!res.ok) { showToast(d.error || 'Failed to submit request', 'error'); return; }
      showToast('Return request submitted! Our team will reach out within 24–48 hours.');
      closeModal('return');
      modalData?.onSuccess?.();
    } catch { showToast('Something went wrong', 'error'); }
    finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => closeModal('return')}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '100%' }}>
        <div className="modal-head">
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400 }}>Return / Exchange</div>
          <button className="xbtn" onClick={() => closeModal('return')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {order && (
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: '.82rem', color: 'var(--fg-muted)' }}>
              Order #{order.id?.slice(-8)?.toUpperCase()} · {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
            </div>
          )}

          <div>
            <div style={{ fontSize: '.73rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>Request Type</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <label className={`variant-btn${type === 'return' ? ' sel' : ''}`} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '10px', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                <input type="radio" name="type" value="return" checked={type === 'return'} onChange={() => setType('return')} style={{ display: 'none' }} />
                Return & Refund
              </label>
              <label className={`variant-btn${type === 'exchange' ? ' sel' : ''}`} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '10px', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                <input type="radio" name="type" value="exchange" checked={type === 'exchange'} onChange={() => setType('exchange')} style={{ display: 'none' }} />
                Exchange
              </label>
            </div>
          </div>

          <div className="ig">
            <label>Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: reason ? 'var(--fg)' : 'var(--fg-muted)', fontFamily: 'var(--font-b)', width: '100%', fontSize: '.88rem' }}>
              <option value="">Select a reason...</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="ig">
            <label>Additional Details (Optional)</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Please describe the issue in detail..." rows={3} />
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '12px 14px', fontSize: '.78rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
            {type === 'return'
              ? '• Refund will be initiated within 5–7 business days after we receive the item.\n• Original packaging preferred.\n• Items must be unused and in original condition.'
              : '• Exchange subject to product availability.\n• Our team will confirm the exchange details within 24–48 hours.\n• Items must be unused and in original condition.'}
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: 13, width: '100%' }}>
            {submitting ? <Spinner size="sm" /> : `Submit ${type === 'return' ? 'Return' : 'Exchange'} Request`}
          </button>
        </form>
      </div>
    </div>
  );
}
