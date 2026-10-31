'use client';
import { useState, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import { authFetch } from '@/lib/authFetch';

export default function AddressModal() {
  const { activeModal, closeModal } = useModal();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
  const [errors, setErrors] = useState({});

  const isOpen = activeModal === 'addresses';

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    authFetch('/api/addresses')
      .then(r => r.json())
      .then(d => setAddresses(d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Required';
    if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Valid 10-digit phone required';
    if (!form.line1.trim()) errs.line1 = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.state.trim()) errs.state = 'Required';
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = '6-digit pincode required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/addresses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { showToast(d.error || 'Failed to save', 'error'); return; }
      setAddresses(prev => {
        const updated = form.isDefault ? prev.map(a => ({ ...a, is_default: false })) : prev;
        return [...updated, d];
      });
      showToast('Address saved');
      setAdding(false);
      setForm({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
      setErrors({});
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    setDeleting(id);
    try {
      await authFetch(`/api/addresses/${id}`, { method: 'DELETE' });
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast('Address deleted');
    } finally { setDeleting(null); }
  };

  const handleSetDefault = async (id) => {
    await authFetch(`/api/addresses/${id}/default`, { method: 'PUT' });
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
    showToast('Default address updated');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => closeModal('addresses')}>
      <div className="modal-box lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-head">
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400 }}>Manage Addresses</div>
          <button className="xbtn" onClick={() => closeModal('addresses')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: '0 22px 22px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}><Spinner /></div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {addresses.map(addr => (
                  <div key={addr.id} className="addr-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '.9rem' }}>{addr.name}
                        {addr.is_default && <span style={{ marginLeft: 8, fontSize: '.7rem', color: 'var(--rose)', fontWeight: 500 }}>Default</span>}
                      </div>
                      <div style={{ fontSize: '.82rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                        {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}, {addr.city}, {addr.state} — {addr.pin}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)' }}>📱 {addr.phone}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      {!addr.is_default && (
                        <button className="btn btn-ghost" style={{ fontSize: '.72rem', padding: '4px 8px' }} onClick={() => handleSetDefault(addr.id)}>
                          Set Default
                        </button>
                      )}
                      <button className="btn btn-ghost" style={{ fontSize: '.72rem', padding: '4px 8px', color: 'var(--danger)' }}
                        disabled={deleting === addr.id} onClick={() => handleDelete(addr.id)}>
                        {deleting === addr.id ? <Spinner size="sm" /> : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--fg-muted)', fontSize: '.9rem' }}>No saved addresses yet.</div>
                )}
              </div>

              {!adding ? (
                <button className="btn btn-outline" style={{ fontSize: '.82rem', gap: 5, width: '100%', padding: '10px' }} onClick={() => setAdding(true)}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Address
                </button>
              ) : (
                <form onSubmit={handleSave} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>New Address</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="ig"><label>Full Name</label><input value={form.fullName} onChange={set('fullName')} />{errors.fullName && <span className="field-err">{errors.fullName}</span>}</div>
                    <div className="ig"><label>Phone</label><input value={form.phone} onChange={set('phone')} maxLength={10} />{errors.phone && <span className="field-err">{errors.phone}</span>}</div>
                  </div>
                  <div className="ig"><label>Address Line 1</label><input value={form.line1} onChange={set('line1')} />{errors.line1 && <span className="field-err">{errors.line1}</span>}</div>
                  <div className="ig"><label>Address Line 2 (Optional)</label><input value={form.line2} onChange={set('line2')} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div className="ig"><label>City</label><input value={form.city} onChange={set('city')} />{errors.city && <span className="field-err">{errors.city}</span>}</div>
                    <div className="ig"><label>State</label><input value={form.state} onChange={set('state')} />{errors.state && <span className="field-err">{errors.state}</span>}</div>
                    <div className="ig"><label>Pincode</label><input value={form.pincode} onChange={set('pincode')} maxLength={6} />{errors.pincode && <span className="field-err">{errors.pincode}</span>}</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.82rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} />
                    Set as default
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? <Spinner size="sm" /> : 'Save Address'}</button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setAdding(false); setErrors({}); }}>Cancel</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
