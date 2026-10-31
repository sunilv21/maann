'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

const STATUSES = ['all', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested'];
const STATUS_COLORS = {
  confirmed: '#7B5EA7', packed: '#C4875A', shipped: '#4A8FC4',
  out_for_delivery: '#C4B44A', delivered: '#4BAF7A', cancelled: '#E05A7A', return_requested: '#E07A5A'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [reloadCount, setReloadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [updating, setUpdating] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setLoadError('');
      const params = filter !== 'all' ? `?status=${filter}` : '';

      try {
        const response = await adminFetch(`/api/admin/orders${params}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Could not load orders (${response.status})`);
        if (!Array.isArray(data)) throw new Error('The orders API returned an unexpected response.');
        if (active) setOrders(data);
      } catch (error) {
        if (active) setLoadError(error.message || 'Could not load orders. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();
    return () => { active = false; };
  }, [filter, reloadCount]);

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const response = await adminFetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update order status');

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: result.status } : o));
      setSelectedOrder(prev => prev?.id === id ? { ...prev, status: result.status } : prev);
      setStatusDrafts(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      showToast('Order status updated');
    } catch (error) {
      showToast(error.message || 'Could not update order status. Please try again.', 'error');
    } finally {
      setUpdating(null);
    }
  }

  const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic', marginBottom: 20 }}>Orders</h1>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
            borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
            background: filter === s ? 'var(--accent)' : 'transparent',
            color: filter === s ? '#fff' : 'var(--fg-muted)',
            fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize'
          }}>{s.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {loading ? <div style={{ color: 'var(--fg-muted)' }}>Loading orders...</div> : loadError ? (
        <div role="alert" style={{ padding: 24, border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)' }}>
          <div>{loadError}</div>
          <button onClick={() => setReloadCount(count => count + 1)} style={{ marginTop: 12, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '11px 14px', fontSize: '.78rem', fontFamily: 'monospace', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{o.id.slice(0, 8).toUpperCase()}</td>
                      <td style={{ padding: '11px 14px', fontSize: '.82rem' }}>
                        <div>{o.address_snapshot?.name || '—'}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--fg-muted)' }}>{o.userEmail}</div>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '.82rem', textAlign: 'center' }}>{o.order_items?.length || 0}</td>
                      <td style={{ padding: '11px 14px', fontSize: '.88rem', fontWeight: 500 }}>{fmt(o.total)}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <select value={statusDrafts[o.id] ?? o.status} onChange={e => setStatusDrafts(prev => ({ ...prev, [o.id]: e.target.value }))}
                          disabled={updating === o.id}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--fg)', fontSize: '.78rem', cursor: 'pointer' }}>
                          {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                        </select>
                        {statusDrafts[o.id] && statusDrafts[o.id] !== o.status && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <button
                              onClick={() => updateStatus(o.id, statusDrafts[o.id])}
                              disabled={updating === o.id}
                              style={{ padding: '4px 8px', border: 'none', borderRadius: 5, background: 'var(--accent)', color: '#fff', fontSize: '.72rem', cursor: updating === o.id ? 'wait' : 'pointer' }}
                            >
                              {updating === o.id ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setStatusDrafts(prev => {
                                const next = { ...prev };
                                delete next[o.id];
                                return next;
                              })}
                              disabled={updating === o.id}
                              style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: 'var(--fg-muted)', fontSize: '.72rem', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '.78rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <button onClick={() => setSelectedOrder(o)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '.8rem' }}>
                          Details
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>No orders found.</div>}
        </div>
      )}

      {selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedOrder(null)}
          role="presentation"
        >
          <section
            className="modal-box lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-details-title"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-head">
              <div>
                <h2 id="admin-order-details-title" className="modal-title">Order Details</h2>
                <div style={{ fontSize: '.78rem', color: 'var(--fg-muted)', fontFamily: 'monospace' }}>
                  #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <button className="xbtn" onClick={() => setSelectedOrder(null)} aria-label="Close order details">×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8 }}>Customer</div>
                  <div style={{ fontSize: '.88rem', lineHeight: 1.6 }}>
                    <strong>{selectedOrder.address_snapshot?.name || '—'}</strong><br />
                    {selectedOrder.userEmail || '—'}<br />
                    {selectedOrder.address_snapshot?.phone || '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8 }}>Order</div>
                  <div style={{ fontSize: '.88rem', lineHeight: 1.8 }}>
                    Status: <strong style={{ textTransform: 'capitalize' }}>{selectedOrder.status?.replace(/_/g, ' ') || '—'}</strong><br />
                    Date: {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}<br />
                    Payment: <strong>{selectedOrder.payment_method?.toUpperCase() || '—'}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8 }}>Items</div>
                {selectedOrder.order_items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                    <span>{item.product_name} {item.variant ? `(${item.variant})` : ''} × {item.qty}</span>
                    <span style={{ color: 'var(--accent)', whiteSpace: 'nowrap' }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                {!selectedOrder.order_items?.length && <div style={{ color: 'var(--fg-muted)', fontSize: '.85rem' }}>No item details available.</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: '.85rem' }}>
                  <span>Shipping</span><span>{fmt(selectedOrder.shipping)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, fontWeight: 600, fontSize: '1rem' }}>
                  <span>Total</span><span style={{ color: 'var(--accent)' }}>{fmt(selectedOrder.total)}</span>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8 }}>Delivery Address</div>
                {selectedOrder.address_snapshot ? (
                  <div style={{ fontSize: '.85rem', lineHeight: 1.6 }}>
                    <strong>{selectedOrder.address_snapshot.name}</strong><br />
                    {selectedOrder.address_snapshot.phone}<br />
                    {selectedOrder.address_snapshot.line1}{selectedOrder.address_snapshot.line2 ? `, ${selectedOrder.address_snapshot.line2}` : ''}<br />
                    {selectedOrder.address_snapshot.city}, {selectedOrder.address_snapshot.state} — {selectedOrder.address_snapshot.pin}
                  </div>
                ) : <div style={{ color: 'var(--fg-muted)', fontSize: '.85rem' }}>No address details available.</div>}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
