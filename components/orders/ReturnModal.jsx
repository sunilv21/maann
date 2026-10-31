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

const RETURN_STEPS = [
  { icon: '📝', title: 'Request Submitted',  desc: 'We receive your request and review it within 24 hrs.' },
  { icon: '📅', title: 'Pickup Scheduled',   desc: 'We schedule a pickup from your delivery address.' },
  { icon: '📦', title: 'Item Picked Up',     desc: 'Our team collects the item from you.' },
  { icon: '✓',  title: 'Refund Processed',   desc: 'Refund credited to your account within 5–7 business days.' },
];
const EXCHANGE_STEPS = [
  { icon: '📝', title: 'Request Submitted',  desc: 'We review your exchange request within 24 hrs.' },
  { icon: '📅', title: 'Pickup Scheduled',   desc: 'We schedule a pickup from your delivery address.' },
  { icon: '📦', title: 'Item Picked Up',     desc: 'Our team collects the original item from you.' },
  { icon: '🚚', title: 'Exchange Dispatched', desc: 'Your replacement is packed and dispatched.' },
];

const COD_METHODS = ['cod'];
const AUTO_REFUND_METHODS = ['upi', 'card', 'netbanking', 'emi', 'wallet'];

export default function ReturnModal() {
  const { activeModal, modalData, closeModal } = useModal();
  const { showToast } = useToast();
  const [step, setStep] = useState(0); // 0=type, 1=reason+refund, 2=success
  const [type, setType] = useState('return');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  // Refund details (only for COD)
  const [refundMode, setRefundMode] = useState('upi'); // 'upi' | 'bank'
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountName, setAccountName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOpen = activeModal === 'return';
  const order = modalData?.order;
  const isCOD = COD_METHODS.includes(order?.payment_method);
  const isAutoRefund = AUTO_REFUND_METHODS.includes(order?.payment_method);

  const handleClose = () => {
    closeModal('return');
    setTimeout(() => {
      setStep(0); setType('return'); setReason(''); setDetails('');
      setUpiId(''); setBankName(''); setAccountNo(''); setIfsc(''); setAccountName('');
    }, 300);
  };

  const validateRefund = () => {
    if (!isCOD || type !== 'return') return true;
    if (refundMode === 'upi') {
      if (!upiId.includes('@')) { showToast('Enter a valid UPI ID (e.g. name@upi)', 'error'); return false; }
    } else {
      if (!accountName.trim()) { showToast('Account holder name is required', 'error'); return false; }
      if (!bankName.trim()) { showToast('Bank name is required', 'error'); return false; }
      if (!/^\d{9,18}$/.test(accountNo)) { showToast('Enter a valid account number', 'error'); return false; }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) { showToast('Enter a valid IFSC code', 'error'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!reason) { showToast('Please select a reason', 'error'); return; }
    if (!validateRefund()) return;
    setSubmitting(true);
    try {
      const body = { type, reason, details };
      if (isCOD && type === 'return') {
        body.refundMode = refundMode;
        if (refundMode === 'upi') { body.upiId = upiId; }
        else { body.bankName = bankName; body.accountNo = accountNo; body.ifsc = ifsc.toUpperCase(); body.accountName = accountName; }
      }
      const res = await authFetch(`/api/orders/${order?.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) { showToast(d.error || 'Failed to submit request', 'error'); return; }
      setStep(2);
      modalData?.onSuccess?.();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally { setSubmitting(false); }
  };

  if (!isOpen) return null;
  const progressSteps = type === 'exchange' ? EXCHANGE_STEPS : RETURN_STEPS;

  return (
    <div className="modal-overlay" onClick={step === 2 ? undefined : handleClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-head">
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400 }}>
            {step === 2 ? 'Request Submitted' : 'Return / Exchange'}
          </div>
          {step < 2 && (
            <button className="xbtn" onClick={handleClose}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        <div style={{ padding: '4px 22px 24px' }}>

          {/* Step 0 — Choose type */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {order && (
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: '.82rem', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                  Order #{order.id?.slice(-8)?.toUpperCase()} · {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
                  {order.payment_method && <span style={{ marginLeft: 8, textTransform: 'uppercase', fontWeight: 500 }}>· {order.payment_method}</span>}
                </div>
              )}
              <div>
                <div style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, marginBottom: 10 }}>What would you like to do?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { id: 'return',   icon: '↩', title: 'Return & Refund',  desc: 'Send back the item and get a full refund.' },
                    { id: 'exchange', icon: '🔄', title: 'Exchange',         desc: 'Swap for a different size, colour, or product.' },
                  ].map(opt => (
                    <label key={opt.id} onClick={() => setType(opt.id)} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10,
                      border: `2px solid ${type === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: type === opt.id ? 'var(--surface)' : 'var(--card)',
                      cursor: 'pointer', transition: 'border-color .15s',
                    }}>
                      <input type="radio" name="ret-type" value={opt.id} checked={type === opt.id} onChange={() => setType(opt.id)} style={{ marginTop: 3, accentColor: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: 3 }}>{opt.icon} {opt.title}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--fg-muted)', lineHeight: 1.5 }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ padding: 13 }} onClick={() => setStep(1)}>Continue →</button>
            </div>
          )}

          {/* Step 1 — Reason + refund details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '.78rem', color: 'var(--fg-muted)', padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                {type === 'return' ? '↩ Return & Refund' : '🔄 Exchange'} · Order #{order?.id?.slice(-8)?.toUpperCase()}
              </div>

              <div className="ig">
                <label>Reason for {type === 'return' ? 'return' : 'exchange'}</label>
                <select value={reason} onChange={e => setReason(e.target.value)}
                  style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: reason ? 'var(--fg)' : 'var(--fg-muted)', fontFamily: 'var(--font-b)', width: '100%', fontSize: '.88rem' }}>
                  <option value="">Select a reason…</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="ig">
                <label>Additional details (optional)</label>
                <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Describe the issue in more detail…" rows={2} style={{ resize: 'vertical' }} />
              </div>

              {/* Refund section — only for return, not exchange */}
              {type === 'return' && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--surface)', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                    Refund Method
                  </div>
                  <div style={{ padding: '14px' }}>
                    {isAutoRefund ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '.85rem', lineHeight: 1.6 }}>
                        <span style={{ fontSize: '1.2rem' }}>✓</span>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>Automatic Razorpay Refund</div>
                          <div style={{ color: 'var(--fg-muted)', fontSize: '.78rem' }}>
                            Your refund will be automatically credited to your original payment method ({order?.payment_method?.toUpperCase()}) within <strong>5–7 business days</strong> via Razorpay once we receive the item.
                          </div>
                        </div>
                      </div>
                    ) : isCOD ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)' }}>
                          Since you paid via Cash on Delivery, please provide your refund details:
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[{ id: 'upi', label: '⚡ UPI' }, { id: 'bank', label: '🏦 Bank Transfer' }].map(m => (
                            <button key={m.id} onClick={() => setRefundMode(m.id)} style={{
                              flex: 1, padding: '9px', borderRadius: 8,
                              border: `2px solid ${refundMode === m.id ? 'var(--accent)' : 'var(--border)'}`,
                              background: refundMode === m.id ? 'var(--surface)' : 'var(--card)',
                              color: refundMode === m.id ? 'var(--accent)' : 'var(--fg-muted)',
                              fontWeight: 600, fontSize: '.8rem', cursor: 'pointer',
                            }}>{m.label}</button>
                          ))}
                        </div>
                        {refundMode === 'upi' ? (
                          <div className="ig" style={{ margin: 0 }}>
                            <label>UPI ID</label>
                            <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div className="ig" style={{ margin: 0 }}>
                              <label>Account Holder Name</label>
                              <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Full name as on bank account" />
                            </div>
                            <div className="ig" style={{ margin: 0 }}>
                              <label>Bank Name</label>
                              <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. State Bank of India" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              <div className="ig" style={{ margin: 0 }}>
                                <label>Account Number</label>
                                <input value={accountNo} onChange={e => setAccountNo(e.target.value.replace(/\D/g, ''))} placeholder="••••••••••••" maxLength={18} />
                              </div>
                              <div className="ig" style={{ margin: 0 }}>
                                <label>IFSC Code</label>
                                <input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="SBIN0001234" maxLength={11} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '.85rem', color: 'var(--fg-muted)' }}>
                        Our team will contact you about your refund after the item is received.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: '.75rem', color: 'var(--fg-muted)', lineHeight: 1.7, border: '1px solid var(--border)' }}>
                {type === 'return'
                  ? '• Items must be unused & in original condition\n• Original packaging preferred\n• Pickup will be scheduled within 24–48 hours of approval'
                  : '• Exchange subject to availability\n• Team confirms within 24–48 hours\n• Items must be unused & in original condition'}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: '0 0 auto', padding: '11px 18px' }} onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1, padding: 13 }} onClick={handleSubmit} disabled={submitting || !reason}>
                  {submitting ? <Spinner size="sm" /> : `Submit ${type === 'return' ? 'Return' : 'Exchange'} Request`}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Success */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{type === 'return' ? '↩' : '🔄'}</div>
                <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 400, marginBottom: 6 }}>
                  {type === 'return' ? 'Return Request Submitted!' : 'Exchange Request Submitted!'}
                </h3>
                <p style={{ fontSize: '.85rem', color: 'var(--fg-muted)', lineHeight: 1.7 }}>
                  Our team will review your request and get back to you within <strong>24–48 hours</strong>.
                </p>
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '16px 18px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, marginBottom: 14 }}>What happens next</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {progressSteps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < progressSteps.length - 1 ? 14 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', color: i === 0 ? '#fff' : 'var(--fg-muted)', flexShrink: 0 }}>
                          {i === 0 ? '✓' : s.icon}
                        </div>
                        {i < progressSteps.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 14, marginTop: 4 }} />}
                      </div>
                      <div style={{ paddingBottom: i < progressSteps.length - 1 ? 14 : 0 }}>
                        <div style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: 2, color: i === 0 ? 'var(--accent)' : 'var(--fg)' }}>{s.title}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--fg-muted)', lineHeight: 1.5 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ padding: 13 }} onClick={handleClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
