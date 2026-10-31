'use client';
import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';

export default function AuthModal() {
  const { activeModal, closeModal } = useModal();
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isOpen = activeModal === 'auth';

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (tab === 'register' && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (tab === 'register' && form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const r = await login(form.email, form.password);
        if (r?.error) { setErrors({ submit: r.error }); return; }
        showToast('Welcome back!');
        closeModal('auth');
      } else {
        const r = await register(form.name, form.email, form.phone, form.password, form.confirm);
        if (r?.error) { setErrors({ submit: r.error }); return; }
        if (r?.needsConfirmation) {
          setErrors({ submit: '✓ Account created! Please check your email to confirm before logging in.' });
          return;
        }
        showToast('Account created! Welcome to Maann ✦');
        closeModal('auth');
      }
    } finally { setLoading(false); }
  };

  const switchTab = (t) => { setTab(t); setErrors({}); setForm({ name: '', email: '', phone: '', password: '', confirm: '' }); setShowPwd(false); setShowConfirm(false); };

  const EyeIcon = ({ show }) => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => closeModal('auth')}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, width: '100%' }}>
        <div className="modal-head">
          <img src="/logo.png" alt="Maann" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <button className="xbtn" onClick={() => closeModal('auth')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'register' && (
            <div className="ig">
              <label>Full Name *</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Your name" autoFocus />
              {errors.name && <span className="field-err">{errors.name}</span>}
            </div>
          )}

          <div className="ig">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" autoFocus={tab === 'login'} />
            {errors.email && <span className="field-err">{errors.email}</span>}
          </div>

          {tab === 'register' && (
            <div className="ig">
              <label>Phone <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </div>
          )}

          <div className="ig">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <EyeIcon show={showPwd} />
              </button>
            </div>
            {errors.password && <span className="field-err">{errors.password}</span>}
          </div>

          {tab === 'register' && (
            <div className="ig">
              <label>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="••••••••" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {errors.confirm && <span className="field-err">{errors.confirm}</span>}
            </div>
          )}

          {errors.submit && (
            <div style={{
              background: errors.submit.startsWith('✓')
                ? 'color-mix(in srgb,var(--success,#22c55e) 12%,transparent)'
                : 'color-mix(in srgb,var(--danger) 12%,transparent)',
              color: errors.submit.startsWith('✓') ? 'var(--success,#16a34a)' : 'var(--danger)',
              padding: '10px 14px', borderRadius: 'var(--r)', fontSize: '.82rem'
            }}>
              {errors.submit}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 13, marginTop: 4, width: '100%' }}>
            {loading ? <Spinner size="sm" /> : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {tab === 'login' && (
            <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--fg-muted)' }}>
              New to Maann?{' '}
              <button type="button" onClick={() => switchTab('register')} style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontFamily: 'var(--font-b)', fontSize: '.78rem', padding: 0, textDecoration: 'underline' }}>
                Create an account
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
