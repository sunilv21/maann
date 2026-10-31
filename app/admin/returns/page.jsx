'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useState, useEffect } from 'react';

const RETURN_STATUSES = ['requested', 'pickup_scheduled', 'picked_up', 'refund_initiated', 'refunded', 'exchanged'];
const STATUS_COLORS = {
  requested: '#E07A5A', pickup_scheduled: '#C4875A', picked_up: '#4A8FC4',
  refund_initiated: '#C4B44A', refunded: '#4BAF7A', exchanged: '#7B5EA7'
};

function getReturnItems(returnRequest) {
  let items = returnRequest.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  if (Array.isArray(items) && items.length) return items;
  return returnRequest.orders?.order_items || [];
}

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    adminFetch('/api/admin/returns').then(r => r.json()).then(d => { setReturns(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function updateStatus(id, status) {
    setUpdating(id);
    await adminFetch(`/api/admin/returns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic', marginBottom: 24 }}>Returns & Exchanges</h1>
      {loading ? <div style={{ color: 'var(--fg-muted)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {returns.map(r => {
            const returnItems = getReturnItems(r);
            return (
              <div key={r.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>
                      {r.type === 'exchange' ? '🔄 Exchange' : '↩ Return'} · {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600 }}>Order #{r.order_id?.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--fg-muted)', marginTop: 2 }}>Reason: {r.reason}</div>
                  </div>
                  <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} disabled={updating === r.id}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid', borderColor: STATUS_COLORS[r.status] || 'var(--border)', background: 'var(--card)', color: 'var(--fg)', fontSize: '.8rem', cursor: 'pointer' }}>
                    {RETURN_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '.83rem' }}>
                  <div>
                    <div style={{ color: 'var(--fg-muted)', marginBottom: 4, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Items</div>
                    {returnItems.map((item, i) => (
                      <div key={item.id || i}>
                        {item.productName || item.product_name || 'Product'}{item.variant ? ` (${item.variant})` : ''} × {item.qty}
                      </div>
                    ))}
                    {!returnItems.length && <div style={{ color: 'var(--fg-muted)' }}>No item details available for this request.</div>}
                  </div>
                  {r.bank_name && (
                    <div>
                      <div style={{ color: 'var(--fg-muted)', marginBottom: 4, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Bank Details</div>
                      <div>{r.bank_name}</div>
                      <div style={{ fontFamily: 'monospace' }}>{r.account_number}</div>
                      <div>IFSC: {r.ifsc}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {returns.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>No return requests yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
