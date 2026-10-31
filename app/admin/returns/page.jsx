'use client';
import { adminFetch } from '@/lib/adminFetch';
import { registerAdminRefresh } from '@/lib/adminRefresh';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';

const RETURN_FLOW = ['requested', 'pickup_scheduled', 'picked_up', 'refund_initiated', 'refunded'];
const EXCHANGE_FLOW = ['requested', 'pickup_scheduled', 'picked_up', 'exchange_dispatched', 'exchange_delivered'];

const STATUS_META = {
  requested:          { color: '#E05A7A', bg: '#fdedf1', label: 'Requested',           icon: '↩' },
  pickup_scheduled:   { color: '#C4875A', bg: '#fdf3eb', label: 'Pickup Scheduled',    icon: '📅' },
  picked_up:          { color: '#4A8FC4', bg: '#eaf3fb', label: 'Picked Up',           icon: '📦' },
  refund_initiated:   { color: '#C4B44A', bg: '#fbf8e8', label: 'Refund Initiated',    icon: '💸' },
  refunded:           { color: '#4BAF7A', bg: '#eaf7f0', label: 'Refunded',            icon: '✓' },
  exchange_dispatched:{ color: '#7B5EA7', bg: '#f0ebf8', label: 'Exchange Dispatched', icon: '🚚' },
  exchange_delivered: { color: '#4BAF7A', bg: '#eaf7f0', label: 'Exchange Delivered',  icon: '✦' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { color: '#888', bg: '#f5f5f5', label: status, icon: '•' };
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

function ReturnStepper({ ret, onUpdate, updating }) {
  const isExchange = ret.type === 'exchange';
  const displayFlow = isExchange ? EXCHANGE_FLOW : RETURN_FLOW;
  const currentIdx = displayFlow.indexOf(ret.status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
      {displayFlow.map((s, i) => {
        const meta = STATUS_META[s];
        const done = currentIdx > i;
        const active = ret.status === s;
        const nextS = displayFlow[i + 1];
        const reachable = nextS && ret.status === s;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => reachable && onUpdate(ret.id, nextS)}
              disabled={!!updating || !reachable}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '8px 10px', borderRadius: 8,
                border: (active || done) ? `2px solid ${meta.color}` : '2px solid var(--border)',
                background: (active || done) ? meta.bg : 'var(--card)',
                color: (active || done) ? meta.color : 'var(--fg-muted)',
                cursor: reachable ? 'pointer' : 'default',
                opacity: (!done && !active) ? 0.45 : 1,
                transition: 'all .2s', minWidth: 70,
              }}
              title={reachable ? `Advance to "${STATUS_META[nextS]?.label}"` : ''}
            >
              <span style={{ fontSize: '1rem' }}>{done ? '✓' : meta.icon}</span>
              <span style={{ fontSize: '.62rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{meta.label}</span>
              {reachable && <span style={{ fontSize: '.58rem', color: meta.color, fontWeight: 700 }}>Tap →</span>}
            </button>
            {i < displayFlow.length - 1 && (
              <div style={{ width: 18, height: 2, flexShrink: 0, background: done ? meta.color : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getItems(ret) {
  let items = ret.items;
  if (typeof items === 'string') { try { items = JSON.parse(items); } catch { items = []; } }
  if (Array.isArray(items) && items.length) return items;
  return ret.order?.order_items || [];
}

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { showToast } = useToast();

  const loadReturns = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await adminFetch('/api/admin/returns');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
      if (!Array.isArray(data)) throw new Error(data.error || 'Unexpected response from returns API');
      setReturns(data);
    } catch (error) {
      setLoadError(error.message || 'Could not load return requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReturns();
    return registerAdminRefresh(loadReturns);
  }, [loadReturns]);

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const res = await adminFetch(`/api/admin/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status: data.status || status } : r));
      setSelected(prev => prev?.id === id ? { ...prev, status: data.status || status } : prev);
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
        .ret-row { transition: background .15s; cursor: pointer; }
        .ret-row:hover { background: var(--surface) !important; }
      `}</style>

      <style>{`.admin-returns-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic', margin: 0 }}>Returns & Exchanges</h1>
        <button
          onClick={loadReturns}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--fg)', fontSize: '.82rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'admin-returns-spin' : ''}>
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--fg-muted)', padding: 20 }}>Loading…</div>
      ) : loadError ? (
        <div style={{ padding: 20, color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div><strong>Error:</strong> {loadError}</div>
          <button onClick={loadReturns} style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--fg)', fontSize: '.8rem', cursor: 'pointer' }}>Try again</button>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {['Order', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map(r => (
                  <tr key={r.id} className="ret-row" onClick={() => setSelected(r)} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontSize: '.78rem', fontFamily: 'monospace', color: 'var(--accent)' }}>
                      #{r.order_id?.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 500 }}>
                        {r.order?.address_snapshot?.fullName || r.order?.address_snapshot?.name || '—'}
                      </div>
                      <div style={{ fontSize: '.72rem', color: 'var(--fg-muted)' }}>{r.userEmail}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '.78rem', fontWeight: 600, color: r.type === 'exchange' ? '#7B5EA7' : '#E05A7A' }}>
                        {r.type === 'exchange' ? '🔄 Exchange' : '↩ Return'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '.85rem', color: 'var(--fg-muted)', textAlign: 'center' }}>
                      {getItems(r).length || r.order?.order_items?.length || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '.9rem', fontWeight: 600 }}>
                      {r.order ? fmt(r.order.total) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '12px 14px', fontSize: '.78rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {returns.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-muted)' }}>No return or exchange requests yet.</div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-head">
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 400 }}>
                  {selected.type === 'exchange' ? '🔄 Exchange' : '↩ Return'} Request
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                  Order #{selected.order_id?.slice(-8).toUpperCase()}
                </div>
              </div>
              <button className="xbtn" onClick={() => setSelected(null)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '4px 22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Status + stepper */}
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '16px 18px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, marginBottom: 10 }}>Status</div>
                <div style={{ marginBottom: 14 }}><StatusBadge status={selected.status} /></div>
                <ReturnStepper ret={selected} onUpdate={updateStatus} updating={updating} />
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: 8 }}>Customer</div>
                  <div style={{ fontSize: '.85rem', lineHeight: 1.7 }}>
                    <strong>{selected.order?.address_snapshot?.fullName || selected.order?.address_snapshot?.name || '—'}</strong><br />
                    <span style={{ color: 'var(--fg-muted)' }}>{selected.userEmail || '—'}</span>
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: 8 }}>Reason</div>
                  <div style={{ fontSize: '.85rem', lineHeight: 1.6 }}>{selected.reason || '—'}</div>
                </div>
                {selected.order && (
                  <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: 8 }}>Order Total</div>
                    <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--accent)' }}>{fmt(selected.order.total)}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)', marginTop: 2 }}>
                      {new Date(selected.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              {(() => {
                const items = getItems(selected);
                return items.length > 0 ? (
                  <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: 10 }}>Items</div>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '.85rem' }}>
                        <span>{item.productName || item.product_name || 'Product'}{item.variant ? ` (${item.variant})` : ''} × {item.qty}</span>
                        {item.price && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{fmt(item.price * item.qty)}</span>}
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Refund details */}
              {selected.type === 'return' && (
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--rose)', fontWeight: 600, marginBottom: 8 }}>Refund Details</div>
                  {selected.upi_id ? (
                    <div style={{ fontSize: '.85rem' }}>⚡ UPI · <strong>{selected.upi_id}</strong></div>
                  ) : selected.bank_name || selected.account_number ? (
                    <div style={{ fontSize: '.85rem', lineHeight: 1.8 }}>
                      🏦 {selected.account_name && <><strong>{selected.account_name}</strong><br /></>}
                      {selected.bank_name} · A/C {selected.account_number} · IFSC {selected.ifsc}
                    </div>
                  ) : (
                    <div style={{ fontSize: '.85rem', color: 'var(--fg-muted)' }}>
                      Automatic Razorpay refund to original payment method
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
