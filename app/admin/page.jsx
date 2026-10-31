'use client';
import { adminFetch } from '@/lib/adminFetch';
import { registerAdminRefresh } from '@/lib/adminRefresh';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: '2.2rem', fontWeight: 600, color: color || 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const STATUS_COLORS = {
  confirmed: '#7B5EA7', packed: '#C4875A', shipped: '#4A8FC4',
  out_for_delivery: '#C4B44A', delivered: '#4BAF7A', cancelled: '#E05A7A', return_requested: '#E07A5A'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminFetch('/api/admin/stats');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Could not load dashboard (${response.status})`);
      setStats(data);
    } catch (loadError) {
      setError(loadError.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    return registerAdminRefresh(loadStats);
  }, [loadStats]);

  const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic', marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: 'var(--fg-muted)', marginBottom: 28, fontSize: '.88rem' }}>Welcome back. Here's what's happening with Maann.</p>
      {error && (
        <div role="alert" style={{ padding: 16, marginBottom: 20, color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 8 }}>
          {error} <button type="button" onClick={loadStats} style={{ marginLeft: 8, color: 'inherit', border: 0, background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Try again</button>
        </div>
      )}
      {loading && !stats ? <div style={{ color: 'var(--fg-muted)', paddingBottom: 20 }}>Loading dashboard…</div> : null}
      {!stats && !loading && !error && <div style={{ color: 'var(--fg-muted)', paddingBottom: 20 }}>No dashboard data available.</div>}

      {stats && <>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Total Revenue" value={fmt(stats.totalRevenue)} sub="All time (excl. cancelled)" color="var(--success)" />
        <StatCard label="Total Orders" value={stats.totalOrders || 0} />
        <StatCard label="Products" value={stats.totalProducts || 0} />
        <StatCard label="Customers" value={stats.totalUsers || 0} />
        {stats.pendingReturns > 0 && <StatCard label="Pending Returns" value={stats.pendingReturns} color="var(--danger)" />}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontStyle: 'italic' }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontSize: '.8rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Order ID', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.recentOrders || []).map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '.82rem', fontFamily: 'monospace', color: 'var(--accent)' }}>{o.id.slice(0, 8).toUpperCase()}</td>
                  <td style={{ padding: '12px 16px', fontSize: '.88rem' }}>{o.order_items?.length || 0} item(s)</td>
                  <td style={{ padding: '12px 16px', fontSize: '.88rem', fontWeight: 500 }}>{fmt(o.total)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: (STATUS_COLORS[o.status] || '#888') + '22', color: STATUS_COLORS[o.status] || '#888', fontSize: '.72rem', padding: '3px 10px', borderRadius: 20, fontWeight: 500, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '.82rem', color: 'var(--fg-muted)' }}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
              {!stats.recentOrders?.length && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--fg-muted)' }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>}
    </div>
  );
}
