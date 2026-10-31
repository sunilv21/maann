'use client';
import { useEffect, useRef } from 'react';
import { useModal } from '@/context/ModalContext';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

const PARTICLES = [
  { x: 20, y: 30, delay: 0,    dur: 1.8, size: 6,  color: '#C9A96E' },
  { x: 80, y: 20, delay: 0.2,  dur: 2.1, size: 4,  color: '#e8d5b7' },
  { x: 50, y: 10, delay: 0.4,  dur: 1.6, size: 8,  color: '#C9A96E' },
  { x: 15, y: 60, delay: 0.1,  dur: 2.3, size: 5,  color: '#d4af7a' },
  { x: 85, y: 50, delay: 0.3,  dur: 1.9, size: 6,  color: '#e8d5b7' },
  { x: 65, y: 15, delay: 0.5,  dur: 2.0, size: 4,  color: '#C9A96E' },
  { x: 35, y: 25, delay: 0.15, dur: 1.7, size: 7,  color: '#d4af7a' },
  { x: 90, y: 75, delay: 0.35, dur: 2.2, size: 5,  color: '#C9A96E' },
  { x: 10, y: 80, delay: 0.25, dur: 1.5, size: 4,  color: '#e8d5b7' },
  { x: 70, y: 85, delay: 0.45, dur: 2.0, size: 6,  color: '#C9A96E' },
  { x: 45, y: 90, delay: 0.55, dur: 1.8, size: 3,  color: '#d4af7a' },
  { x: 25, y: 45, delay: 0.08, dur: 2.1, size: 5,  color: '#C9A96E' },
];

export default function ConfirmStep({ order }) {
  const { closeModal, openModal } = useModal();
  const ringRef = useRef(null);

  useEffect(() => {
    if (!ringRef.current) return;
    ringRef.current.style.strokeDashoffset = '251';
    requestAnimationFrame(() => {
      ringRef.current.style.transition = 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1) .3s';
      ringRef.current.style.strokeDashoffset = '0';
    });
  }, []);

  if (!order) return null;

  return (
    <>
      <style>{`
        @keyframes confirm-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes particle-float {
          0%   { opacity: 0; transform: translateY(0) scale(0) rotate(0deg); }
          20%  { opacity: 1; }
          80%  { opacity: .8; }
          100% { opacity: 0; transform: translateY(-80px) scale(1.2) rotate(180deg); }
        }
        @keyframes gem-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: .9; }
          50%       { transform: scale(1.15) rotate(15deg); opacity: 1; }
        }
        @keyframes checkmark-draw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        .confirm-content > * {
          animation: confirm-fade-up .5s ease both;
        }
        .confirm-content > *:nth-child(1) { animation-delay: .9s; }
        .confirm-content > *:nth-child(2) { animation-delay: 1.05s; }
        .confirm-content > *:nth-child(3) { animation-delay: 1.15s; }
        .confirm-content > *:nth-child(4) { animation-delay: 1.25s; }
        .confirm-content > *:nth-child(5) { animation-delay: 1.35s; }
        .confirm-content > *:nth-child(6) { animation-delay: 1.45s; }
      `}</style>

      <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
        {/* Hero animation area */}
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 28px' }}>
          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: p.color,
              animation: `particle-float ${p.dur}s ease-out ${p.delay}s both`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* Outer decorative ring */}
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="70" cy="70" r="62" fill="none" stroke="#C9A96E" strokeWidth="1" strokeOpacity=".25"
              strokeDasharray="4 6" style={{ animation: 'confirm-fade-up .6s ease .2s both' }} />
            <circle cx="70" cy="70" r="54" fill="none" stroke="#C9A96E" strokeWidth="1.5" strokeOpacity=".15"
              style={{ animation: 'confirm-fade-up .6s ease .35s both' }} />
            {/* Animated progress ring */}
            <circle ref={ringRef} cx="70" cy="70" r="40" fill="none"
              stroke="#C9A96E" strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="251"
              strokeDashoffset="251"
              transform="rotate(-90 70 70)" />
          </svg>

          {/* Center gem icon */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ animation: 'gem-pulse 2.5s ease-in-out 1.2s infinite' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <polygon points="18,3 33,13 28,30 8,30 3,13" fill="#C9A96E" fillOpacity=".15" stroke="#C9A96E" strokeWidth="1.5" />
                <polygon points="18,3 33,13 18,30 3,13" fill="#C9A96E" fillOpacity=".08" />
                <polyline points="3,13 18,8 33,13" stroke="#C9A96E" strokeWidth="1" strokeOpacity=".6" />
                <line x1="18" y1="3" x2="18" y2="30" stroke="#C9A96E" strokeWidth=".8" strokeOpacity=".4" />
              </svg>
            </div>
            {/* Animated checkmark */}
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" style={{ marginTop: -2 }}>
              <polyline points="1,8 7,14 21,1" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="40" style={{ animation: 'checkmark-draw .5s cubic-bezier(.4,0,.2,1) 1s both' }} />
            </svg>
          </div>
        </div>

        <div className="confirm-content">
          <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '1.8rem', fontStyle: 'italic', fontWeight: 400, marginBottom: 6, color: 'var(--fg)' }}>
            Order Placed!
          </h2>
          <p style={{ color: 'var(--fg-muted)', fontSize: '.88rem', marginBottom: 24, lineHeight: 1.8 }}>
            Thank you for your order. We'll begin crafting your pieces shortly.
          </p>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 18, textAlign: 'left', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 12, fontWeight: 600 }}>Order Details</div>
            <div className="cs-row"><span>Order ID</span><span style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--accent)' }}>#{order.id?.slice(-8)?.toUpperCase()}</span></div>
            <div className="cs-row"><span>Status</span><span style={{ color: 'var(--success)', fontWeight: 500, textTransform: 'capitalize' }}>{order.status}</span></div>
            <div className="cs-row"><span>Payment</span><span style={{ textTransform: 'capitalize' }}>{order.payment_method?.replace('_', ' ')}</span></div>
            <div className="cs-row total" style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
              <span>Total Paid</span><span className="price-highlight" style={{ fontSize: '1rem' }}>{fmt(order.total)}</span>
            </div>
          </div>

          {order.order_items?.length > 0 && (
            <div style={{ marginBottom: 18, textAlign: 'left' }}>
              <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 600 }}>Items Ordered</div>
              {order.order_items.map((item, i) => (
                <div key={i} className="cs-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '.85rem' }}>{item.product_name}{item.variant ? ` (${item.variant})` : ''} <span style={{ color: 'var(--fg-muted)' }}>× {item.qty}</span></span>
                  <span className="price-highlight" style={{ fontSize: '.85rem' }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)', marginBottom: 24, lineHeight: 1.8, padding: '10px 14px', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
            ✦ Expected delivery in <strong style={{ color: 'var(--fg)' }}>5–7 business days</strong>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { closeModal('checkout'); openModal('orders'); }} style={{ padding: '11px 24px' }}>
              View My Orders
            </button>
            <button className="btn btn-outline" onClick={() => closeModal('checkout')} style={{ padding: '11px 24px' }}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
