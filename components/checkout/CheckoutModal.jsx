'use client';
import { useState, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import DeliveryStep from './DeliveryStep';
import PaymentStep from './PaymentStep';
import ConfirmStep from './ConfirmStep';

const STEPS = ['Delivery', 'Payment', 'Confirmation'];

export default function CheckoutModal() {
  const { activeModal, closeModal } = useModal();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [order, setOrder] = useState(null);

  const isOpen = activeModal === 'checkout';

  // Reset flow whenever the modal closes, regardless of how it was dismissed
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => { setStep(0); setAddress(null); setOrder(null); }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleClose = () => closeModal('checkout');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={step === 2 ? undefined : handleClose}>
      <div className="modal-box lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-head">
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400 }}>
            Checkout
          </div>
          {step < 2 && (
            <button className="xbtn" onClick={handleClose}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {step < 2 && (
          <div className="checkout-steps">
            {STEPS.slice(0, 2).map((s, i) => (
              <div key={s} className={`cs-step${i === step ? ' active' : i < step ? ' done' : ''}`}>
                <div className="cs-num">{i < step ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '4px 22px 22px' }}>
          {step === 0 && (
            <DeliveryStep
              onNext={(addr) => { setAddress(addr); setStep(1); }}
            />
          )}
          {step === 1 && (
            <PaymentStep
              address={address}
              onBack={() => setStep(0)}
              onSuccess={(ord) => { setOrder(ord); setStep(2); }}
            />
          )}
          {step === 2 && (
            <ConfirmStep order={order} />
          )}
        </div>
      </div>
    </div>
  );
}
