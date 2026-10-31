'use client';
import { useModal } from '@/context/ModalContext';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

export default function ConfirmStep({ order }) {
  const { closeModal, openModal } = useModal();

  if (!order) return null;

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>✦</div>
      <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '1.6rem', fontStyle: 'italic', fontWeight: 400, marginBottom: 8 }}>Order Placed!</h2>
      <p style={{ color: 'var(--fg-muted)', fontSize: '.9rem', marginBottom: 20, lineHeight: 1.7 }}>
        Thank you for your order. We've received your purchase and will begin processing it shortly.
      </p>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 22, textAlign: 'left' }}>
        <div style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 500 }}>Order Details</div>
        <div className="cs-row"><span>Order ID</span><span style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>#{order.id?.slice(-8)?.toUpperCase()}</span></div>
        <div className="cs-row"><span>Status</span><span style={{ color: 'var(--success)', fontWeight: 500, textTransform: 'capitalize' }}>{order.status}</span></div>
        <div className="cs-row"><span>Payment</span><span style={{ textTransform: 'capitalize' }}>{order.payment_method?.replace('_', ' ')}</span></div>
        <div className="cs-row total"><span>Total Paid</span><span className="price-highlight">{fmt(order.total)}</span></div>
      </div>

      {order.order_items?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 500, textAlign: 'left' }}>Items Ordered</div>
          {order.order_items.map((item, i) => (
            <div key={i} className="cs-row" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{item.product_name} {item.variant ? `(${item.variant})` : ''} × {item.qty}</span>
              <span className="price-highlight">{fmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: '.82rem', color: 'var(--fg-muted)', marginBottom: 24, lineHeight: 1.7 }}>
        Expected delivery in <strong>5–7 business days</strong>. You can track your order from your profile.
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => { closeModal('checkout'); openModal('orders'); }} style={{ padding: '10px 22px' }}>
          View My Orders
        </button>
        <button className="btn btn-outline" onClick={() => closeModal('checkout')} style={{ padding: '10px 22px' }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
