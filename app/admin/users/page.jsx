'use client';
import { adminFetch } from '@/lib/adminFetch';
import { registerAdminRefresh } from '@/lib/adminRefresh';
import { useState, useEffect, useCallback } from 'react';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
const timeAgo = d => {
  if (!d) return 'Never';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(d);
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminFetch('/api/admin/users');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to load users (${response.status})`);
      if (!Array.isArray(data)) throw new Error(data.error || 'Users API returned an unexpected response.');
      setUsers(data);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    return registerAdminRefresh(loadUsers);
  }, [loadUsers]);

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .user-row { transition: background .15s; }
        .user-row:hover { background: var(--surface) !important; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic', margin: 0 }}>Users</h1>
          {!loading && !error && (
            <div style={{ fontSize: '.72rem', color: 'var(--fg-muted)', marginTop: 2 }}>{users.length} registered</div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--fg-muted)', padding: 20 }}>Loading users…</div>
      ) : error ? (
        <div style={{ padding: 24, border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)' }}>
          <div>{error}</div>
          <button onClick={loadUsers} style={{ marginTop: 12, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)', cursor: 'pointer', fontSize: '.82rem' }}>
            Try again
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Last Login'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="user-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 16px', fontSize: '.88rem', fontWeight: 500 }}>{u.name || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: '.82rem', color: 'var(--fg-muted)' }}>{u.email}</td>
                    <td style={{ padding: '11px 16px', fontSize: '.82rem', color: 'var(--fg-muted)' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        background: u.isAdmin ? 'color-mix(in srgb,var(--accent) 15%,transparent)' : 'var(--surface)',
                        color: u.isAdmin ? 'var(--accent)' : 'var(--fg-muted)',
                        fontSize: '.72rem', padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                        border: `1px solid ${u.isAdmin ? 'color-mix(in srgb,var(--accent) 30%,transparent)' : 'var(--border)'}`,
                      }}>
                        {u.isAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '.78rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
                      <div>{fmtDate(u.createdAt)}</div>
                      <div style={{ fontSize: '.7rem', opacity: .7 }}>{fmtTime(u.createdAt)}</div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                      {u.lastLogin ? (
                        <>
                          <div style={{ color: 'var(--fg)', fontWeight: 500 }}>{timeAgo(u.lastLogin)}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--fg-muted)', opacity: .8 }}>{fmtDate(u.lastLogin)} {fmtTime(u.lastLogin)}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--fg-muted)', opacity: .5 }}>Never</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>No users found.</div>
          )}
        </div>
      )}
    </div>
  );
}
