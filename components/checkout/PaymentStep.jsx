'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Spinner from '@/components/ui/Spinner';
import { authFetch } from '@/lib/authFetch';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

const METHODS = [
  { id: 'upi', label: 'UPI', icon: '⚡', desc: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major Indian banks' },
  { id: 'emi', label: 'EMI', icon: '📅', desc: 'No-cost EMI on select cards' },
  { id: 'wallet', label: 'Wallets', icon: '👝', desc: 'Paytm, Mobikwik, Amazon Pay' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💰', desc: '+₹50 handling fee' },
];

export default function PaymentStep({ address, onBack, onSuccess }) {
  const { subtotal, shipping, cartTotal } = useCart();
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const total = method === 'cod' ? cartTotal + 50 : cartTotal;

  const handlePay = async () => {
    if (method === 'upi' && !upiId.includes('@')) { setError('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setError('');
    setPlacing(true);

    try {
      let paymentResponse = null;
      if (method !== 'cod') {
        const orderRes = await authFetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: method }),
        });
        
        if (!orderRes.ok) {
          const errorData = await orderRes.json();
          setError(errorData.error || 'Failed to create payment order');
          return;
        }
        
        const orderData = await orderRes.json();

        if (!orderData.simulated && typeof window !== 'undefined' && window.Razorpay) {
          paymentResponse = await new Promise((resolve, reject) => {
            const rp = new window.Razorpay({
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              amount: orderData.amount,
              currency: 'INR',
              name: 'Maann',
              description: 'Jewellery Order',
              order_id: orderData.orderId,
              handler: async (response) => {
                const verifyRes = await authFetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(response),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.verified) resolve(response);
                else reject(new Error('Payment verification failed'));
              },
              prefill: { name: address?.name, contact: address?.phone },
              theme: { color: '#C9A96E' },
            });
            rp.on('payment.failed', () => reject(new Error('Payment failed')));
            rp.open();
          });
        }
      }

      const createRes = await authFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: address.id,
          paymentMethod: method,
          paymentId: paymentResponse?.razorpayPaymentId || null,
          razorpayOrderId: paymentResponse?.razorpayOrderId || null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) { 
        setError(createData.error || 'Failed to place order. Please try logging out and back in.'); 
        return; 
      }
      onSuccess(createData.order);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400, marginBottom: 18 }}>Payment</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
        {METHODS.map(m => (
          <label key={m.id} className={`pay-method${method === m.id ? ' sel' : ''}`} onClick={() => { setMethod(m.id); setError(''); }}>
            <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id)} style={{ marginRight: 8 }} />
            <div>
              <div style={{ fontSize: '.9rem', fontWeight: 500 }}>{m.icon} {m.label}</div>
              <div style={{ fontSize: '.74rem', color: 'var(--fg-muted)' }}>{m.desc}</div>
            </div>
          </label>
        ))}
      </div>

      {method === 'upi' && (
        <div className="ig" style={{ marginBottom: 14 }}>
          <label>UPI ID</label>
          <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
        </div>
      )}
      {method === 'card' && (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: '.78rem', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 500 }}>Card details will be securely handled by Razorpay</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="ig" style={{ gridColumn: '1 / -1' }}><label>Card Number</label><input placeholder="•••• •••• •••• ••••" maxLength={19} /></div>
            <div className="ig"><label>Expiry</label><input placeholder="MM/YY" maxLength={5} /></div>
            <div className="ig"><label>CVV</label><input placeholder="•••" maxLength={3} type="password" /></div>
            <div className="ig" style={{ gridColumn: '1 / -1' }}><label>Name on Card</label><input placeholder="As on card" /></div>
          </div>
        </div>
      )}
      {method === 'netbanking' && (
        <div className="ig" style={{ marginBottom: 14 }}>
          <label>Select Bank</label>
          <select style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: 'var(--fg)', fontFamily: 'var(--font-b)', width: '100%' }}>
            <option>State Bank of India</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>Axis Bank</option>
            <option>Kotak Mahindra Bank</option>
            <option>Punjab National Bank</option>
          </select>
        </div>
      )}
      {method === 'emi' && (
        <div className="ig" style={{ marginBottom: 14 }}>
          <label>EMI Tenure</label>
          <select style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: 'var(--fg)', fontFamily: 'var(--font-b)', width: '100%' }}>
            <option>3 months (No-cost)</option>
            <option>6 months (No-cost)</option>
            <option>9 months</option>
            <option>12 months</option>
          </select>
        </div>
      )}
      {method === 'wallet' && (
        <div className="ig" style={{ marginBottom: 14 }}>
          <label>Select Wallet</label>
          <select style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: 'var(--fg)', fontFamily: 'var(--font-b)', width: '100%' }}>
            <option>Paytm</option>
            <option>PhonePe</option>
            <option>Mobikwik</option>
            <option>Amazon Pay</option>
            <option>Freecharge</option>
          </select>
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 18 }}>
        <div className="cs-row"><span>Subtotal</span><span className="price-highlight">{fmt(subtotal)}</span></div>
        <div className="cs-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : <span className="price-highlight">{fmt(shipping)}</span>}</span></div>
        {method === 'cod' && <div className="cs-row"><span>COD Handling</span><span className="price-highlight">{fmt(50)}</span></div>}
        <div className="cs-row total"><span>Total Payable</span><span className="price-highlight">{fmt(total)}</span></div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 'var(--r)', fontSize: '.82rem', marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: '0 0 auto', padding: '11px 20px' }} onClick={onBack} disabled={placing}>← Back</button>
        <button className="btn btn-primary" style={{ flex: 1, padding: 13 }} onClick={handlePay} disabled={placing}>
          {placing ? <Spinner size="sm" /> : <>Pay <span className="price-highlight">{fmt(total)}</span></>}
        </button>
      </div>
    </div>
  );
}
