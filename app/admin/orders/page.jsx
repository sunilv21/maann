'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

const FLOW = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const ALL_STATUSES = [...FLOW, 'cancelled', 'return_requested'];
const FILTER_TABS = ['all', ...ALL_STATUSES];

const STATUS_META = {
  confirmed:        { color: '#7B5EA7', bg: '#f0ebf8', label: 'Confirmed',        icon: '✓' },
  packed:           { color: '#C4875A', bg: '#fdf3eb', label: 'Packed',            icon: '📦' },
  shipped:          { color: '#4A8FC4', bg: '#eaf3fb', label: 'Shipped',           icon: '🚚' },
  out_for_delivery: { color: '#C4B44A', bg: '#fbf8e8', label: 'Out for Delivery',  icon: '🛵' },
  delivered:        { color: '#4BAF7A', bg: '#eaf7f0', label: 'Delivered',         icon: '✦' },
  cancelled:        { color: '#E05A7A', bg: '#fdedf1', label: 'Cancelled',         icon: '✕' },
  return_requested: { color: '#E07A5A', bg: '#fdf0eb', label: 'Return Requested',  icon: '↩' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { color: '#888', bg: '#f5f5f5', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: m.bg, color: m.color,
      fontSize: '.72rem', fontWeight: 600, whiteSpace: 'nowrap',
      border: `1px solid ${m.color}30`,
    }}>
      {m.icon} {m.label}
    </span>
  );
}

function StatusStepper({ order, onUpdate, updating }) {
  const currentIdx = FLOW.indexOf(order.status);
  const isOffFlow = !FLOW.includes(order.status);

  return (
    <div>
      {/* Progress stepper for the main flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {FLOW.map((s, i) => {
          const meta = STATUS_META[s];
          const done = currentIdx > i;
          const active = order.status === s;
          const reachable = !isOffFlow && i === currentIdx + 1;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={() => reachable && onUpdate(order.id, s)}
                disabled={updating || (!reachable)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 10px', borderRadius: 8,
                  border: active ? `2px solid ${meta.color}` : done ? `2px solid ${meta.color}` : '2px solid var(--border)',
                  background: active ? meta.bg : done ? meta.bg : 'var(--card)',
                  color: (active || done) ? meta.color : 'var(--fg-muted)',
                  cursor: reachable ? 'pointer' : 'default',
                  opacity: (!done && !active && !reachable) ? 0.45 : 1,
                  transition: 'all .2s',
                  minWidth: 72,
                }}
                title={reachable ? `Advance to "${meta.label}"` : ''}
              >
                <span style={{ fontSize: '1.1rem' }}>{done ? '✓' : meta.icon}</span>
                <span style={{ fontSize: '.65rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                  {meta.label}
                </span>
                {reachable && (
                  <span style={{ fontSize: '.6rem', color: meta.color, fontWeight: 700 }}>Tap →</span>
                )}
              </button>
              {i < FLOW.length - 1 && (
                <div style={{
                  width: 24, height: 2, flexShrink: 0,
                  background: done ? STATUS_META[FLOW[i]].color : 'var(--border)',
                }} />
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [reloadCount, setReloadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setLoadError('');
      try {
        const res = await adminFetch(`/api/admin/orders${filter !== 'all' ? `?status=${filter}` : ''}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        if (!Array.isArray(data)) throw new Error('Unexpected response from orders API');
        if (active) setOrders(data);
      } catch (e) {
        if (active) setLoadError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [filter, reloadCount]);

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const res = await adminFetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: result.status } : o));
      setSelectedOrder(prev => prev?.id === id ? { ...prev, status: result.status } : prev);
      showToast(`Status → ${STATUS_META[status]?.label || status}`);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setUpdating(null);
    }
  }

  const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <div>
      <style>{`
        .order-row { transition: background .15s; cursor: pointer; }
        .order-row:hover { background: var(--surface) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic', margin: 0 }}>Orders</h1>
        <button
          onClick={() => setReloadCount(c => c + 1)}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)', fontSize: '.82rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTER_TABS.map(s => {
          const meta = STATUS_META[s];
          const active = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '5px 13px', borderRadius: 20,
              border: `1.5px solid ${active && meta ? meta.color : active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? (meta?.bg || 'var(--accent)') : 'transparent',
              color: active ? (meta?.color || '#fff') : 'var(--fg-muted)',
              fontSize: '.73rem', fontWeight: 600, cursor: 'pointer',
            }}>
              {s === 'all' ? 'All Orders' : (meta?.label || s)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ color: 'var(--fg-muted)', padding: 20 }}>Loading orders…</div>
      ) : loadError ? (
        <div style={{ padding: 24, border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)' }}>
          <div>{loadError}</div>
          <button onClick={() => setReloadCount(c => c + 1)} style={{ marginTop: 12, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)', cursor: 'pointer', fontSize: '.82rem' }}>
            Try again
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="order-row" onClick={() => setSelectedOrder(o)} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontSize: '.78rem', fontFamily: 'monospace', color: 'var(--accent)' }}>
                      #{o.id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{o.address_snapshot?.fullName || o.address_snapshot?.name || '—'}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--fg-muted)' }}>{o.userEmail}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '.85rem', textAlign: 'center', color: 'var(--fg-muted)' }}>
                      {o.order_items?.length || 0}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '.9rem', fontWeight: 600 }}>{fmt(o.total)}</td>
                    <td style={{ padding: '12px 14px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding: '12px 14px', fontSize: '.78rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
                      <div>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--fg-muted)', opacity: .7 }}>{new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-muted)' }}>No orders found.</div>
          )}
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-head">
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400 }}>Order Details</div>
                <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                  #{selectedOrder.id.slice(-8).toUpperCase()}
                </div>
              </div>
              <button className="xbtn" onClick={() => setSelectedOrder(null)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '4px 22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Status stepper */}
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '16px 18px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, marginBottom: 14 }}>
                  Order Status
                </div>
                <div style={{ marginBottom: 8 }}><StatusBadge status={selectedOrder.status} /></div>
                <div style={{ marginTop: 14 }}>
                  <StatusStepper order={selectedOrder} onUpdate={updateStatus} updating={updating} />
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8, fontWeight: 600 }}>Customer</div>
                  <div style={{ fontSize: '.85rem', lineHeight: 1.7 }}>
                    <strong>{selectedOrder.address_snapshot?.fullName || selectedOrder.address_snapshot?.name || '—'}</strong><br />
                    <span style={{ color: 'var(--fg-muted)' }}>{selectedOrder.userEmail || '—'}</span><br />
                    {selectedOrder.address_snapshot?.phone || '—'}
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8, fontWeight: 600 }}>Payment</div>
                  <div style={{ fontSize: '.85rem', lineHeight: 1.7 }}>
                    <strong style={{ textTransform: 'uppercase' }}>{selectedOrder.payment_method || '—'}</strong><br />
                    <span style={{ color: 'var(--fg-muted)' }}>
                      {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8, fontWeight: 600 }}>Delivery</div>
                  <div style={{ fontSize: '.82rem', lineHeight: 1.7, color: 'var(--fg-muted)' }}>
                    {selectedOrder.address_snapshot ? (
                      <>
                        {selectedOrder.address_snapshot.line1}{selectedOrder.address_snapshot.line2 ? `, ${selectedOrder.address_snapshot.line2}` : ''}<br />
                        {selectedOrder.address_snapshot.city}, {selectedOrder.address_snapshot.state} {selectedOrder.address_snapshot.pincode || selectedOrder.address_snapshot.pin}
                      </>
                    ) : '—'}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 12, fontWeight: 600 }}>Items Ordered</div>
                {selectedOrder.order_items?.length > 0 ? (
                  selectedOrder.order_items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                      <span>{item.product_name}{item.variant ? ` (${item.variant})` : ''} <span style={{ color: 'var(--fg-muted)' }}>× {item.qty}</span></span>
                      <span style={{ color: 'var(--accent)', whiteSpace: 'nowrap', fontWeight: 500 }}>{fmt(item.price * item.qty)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--fg-muted)', fontSize: '.85rem' }}>No item details available.</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '.82rem', color: 'var(--fg-muted)' }}>
                  <span>Shipping</span><span>{fmt(selectedOrder.shipping)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: '1rem', fontWeight: 600 }}>
                  <span>Total</span><span style={{ color: 'var(--accent)' }}>{fmt(selectedOrder.total)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
