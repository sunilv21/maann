'use client';
import { useState, useEffect, useCallback } from 'react';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';
import { authFetch } from '@/lib/authFetch';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const ORDER_FLOW = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const ORDER_STEP_LABELS = {
  confirmed: { label: 'Confirmed', icon: '✓' },
  packed:    { label: 'Packed',    icon: '📦' },
  shipped:   { label: 'Shipped',   icon: '🚚' },
  out_for_delivery: { label: 'Out for Delivery', icon: '🛵' },
  delivered: { label: 'Delivered', icon: '✦' },
};
const STATUS_LABELS = {
  confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
  cancelled: 'Cancelled', return_requested: 'Return / Exchange Requested',
  returned: 'Returned', exchange_delivered: 'Exchange Delivered',
};

const RETURN_FLOW = ['requested', 'pickup_scheduled', 'picked_up', 'refunded'];
const EXCHANGE_FLOW = ['requested', 'pickup_scheduled', 'picked_up', 'exchange_dispatched', 'exchange_delivered'];
const RETURN_STEP_LABELS = {
  requested:          { label: 'Requested',        icon: '📝' },
  pickup_scheduled:   { label: 'Pickup Scheduled', icon: '📅' },
  picked_up:          { label: 'Picked Up',        icon: '📦' },
  refund_initiated:   { label: 'Refund Initiated', icon: '💸' },
  refunded:           { label: 'Refunded',         icon: '✓' },
  exchange_dispatched:{ label: 'Out for Delivery', icon: '🚚' },
  exchange_delivered: { label: 'Delivered',        icon: '✦' },
};

function OrderTimeline({ status }) {
  const idx = ORDER_FLOW.indexOf(status);
  if (idx === -1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', margin: '14px 0', paddingBottom: 4 }}>
      {ORDER_FLOW.map((s, i) => {
        const meta = ORDER_STEP_LABELS[s];
        const done = idx > i;
        const active = idx === i;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 8px', borderRadius: 8, minWidth: 58,
              border: `1.5px solid ${(done || active) ? 'var(--accent)' : 'var(--border)'}`,
              background: (done || active) ? 'rgba(var(--accent-rgb, 201,169,110),.08)' : 'var(--card)',
              color: (done || active) ? 'var(--accent)' : 'var(--fg-muted)',
              opacity: (!done && !active) ? 0.5 : 1,
            }}>
              <span style={{ fontSize: '.85rem' }}>{done ? '✓' : meta.icon}</span>
              <span style={{ fontSize: '.6rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{meta.label}</span>
            </div>
            {i < ORDER_FLOW.length - 1 && (
              <div style={{ width: 16, height: 2, flexShrink: 0, background: done ? 'var(--accent)' : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReturnTimeline({ returnRequest }) {
  if (!returnRequest) return null;
  const isExchange = returnRequest.type === 'exchange';
  const flow = isExchange ? EXCHANGE_FLOW : RETURN_FLOW;
  const currentIdx = flow.indexOf(returnRequest.status);
  const displayFlow = isExchange
    ? ['requested', 'pickup_scheduled', 'picked_up', 'exchange_dispatched', 'exchange_delivered']
    : ['requested', 'pickup_scheduled', 'picked_up', 'refunded'];

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '12px 14px', marginTop: 12, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, marginBottom: 10 }}>
        {isExchange ? '🔄 Exchange' : '↩ Return'} · {returnRequest.reason}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 2 }}>
        {displayFlow.map((s, i) => {
          const meta = RETURN_STEP_LABELS[s] || { label: s, icon: '•' };
          const done = currentIdx > i;
          const active = returnRequest.status === s
            || (s === 'refunded' && returnRequest.status === 'refund_initiated');
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 8px', borderRadius: 8, minWidth: 62,
                border: `1.5px solid ${(done || active) ? '#C4875A' : 'var(--border)'}`,
                background: (done || active) ? '#fdf3eb' : 'var(--card)',
                color: (done || active) ? '#C4875A' : 'var(--fg-muted)',
                opacity: (!done && !active) ? 0.5 : 1,
              }}>
                <span style={{ fontSize: '.85rem' }}>{done ? '✓' : meta.icon}</span>
                <span style={{ fontSize: '.58rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{meta.label}</span>
              </div>
              {i < displayFlow.length - 1 && (
                <div style={{ width: 14, height: 2, flexShrink: 0, background: done ? '#C4875A' : 'var(--border)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersModal() {
  const { activeModal, closeModal, openModal } = useModal();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const isOpen = activeModal === 'orders';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/orders');
      const d = await res.json();
      if (!res.ok) {
        showToast(d.error || 'Could not load orders', 'error');
        return;
      }
      setOrders(Array.isArray(d) ? d.map(order => ({
        ...order,
        returnRequest: order.return_requests?.[0] || null,
      })) : []);
    } catch {
      showToast('Could not load orders. Please try again.', 'error');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(orderId);
    try {
      const res = await authFetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) { showToast('Order cancelled'); await load(); }
      else { const d = await res.json(); showToast(d.error || 'Cannot cancel order', 'error'); }
    } catch {
      showToast('Could not cancel this order. Please try again.', 'error');
    } finally { setCancelling(null); }
  };

  const handleReturn = (order) => {
    openModal('return', { order, onSuccess: load });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => closeModal('orders')}>
      <div className="modal-box xl" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-head">
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400 }}>My Orders</div>
          <button className="xbtn" onClick={() => closeModal('orders')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: '0 22px 22px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spinner size="lg" /></div>
          ) : orders.length === 0 ? (
            <div className="empty" style={{ padding: '60px 0' }}>
              <div className="empty-ico">📦</div>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here.</p>
              <button className="btn btn-primary" onClick={() => closeModal('orders')} style={{ marginTop: 12 }}>Browse Collection</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <div
                    style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', flexWrap: 'wrap', gap: 8 }}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <div>
                      <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)', marginBottom: 2 }}>Order #{order.id?.slice(-8)?.toUpperCase()}</div>
                      <div className="price-highlight" style={{ fontSize: '.9rem', fontWeight: 500 }}>{fmt(order.total)}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--fg-muted)' }}>{fmtDate(order.created_at)} · {order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`order-status ${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: expanded === order.id ? 'rotate(180deg)' : 'none', transition: '.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>

                  {expanded === order.id && (
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ marginBottom: 16 }}>
                        {order.order_items?.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '.88rem' }}>
                            <span>{item.product_name} {item.variant ? `(${item.variant})` : ''} × {item.qty}</span>
                            <span className="price-highlight">{fmt(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>

                      {order.address_snapshot && (
                        <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                          <strong style={{ color: 'var(--fg)' }}>Delivery to:</strong> {order.address_snapshot.name}, {order.address_snapshot.line1}{order.address_snapshot.line2 ? ', ' + order.address_snapshot.line2 : ''}, {order.address_snapshot.city}, {order.address_snapshot.state} — {order.address_snapshot.pin}
                        </div>
                      )}

                      {ORDER_FLOW.includes(order.status) && <OrderTimeline status={order.status} />}

                      {order.returnRequest && <ReturnTimeline returnRequest={order.returnRequest} />}

                      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                        {order.status === 'confirmed' && (
                          <button className="btn btn-outline" style={{ fontSize: '.78rem', padding: '8px 14px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            disabled={cancelling === order.id} onClick={() => handleCancel(order.id)}>
                            {cancelling === order.id ? <Spinner size="sm" /> : 'Cancel Order'}
                          </button>
                        )}
                        {order.status === 'delivered' && !order.returnRequest && (
                          <button className="btn btn-outline" style={{ fontSize: '.78rem', padding: '8px 14px' }} onClick={() => handleReturn(order)}>
                            Return / Exchange
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
