'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic', marginBottom: 24 }}>Users</h1>
      {loading ? <div style={{ color: 'var(--fg-muted)' }}>Loading...</div> : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {['Name', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 16px', fontSize: '.88rem' }}>{u.name || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: '.85rem', color: 'var(--fg-muted)' }}>{u.email}</td>
                    <td style={{ padding: '11px 16px', fontSize: '.85rem', color: 'var(--fg-muted)' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        background: u.isAdmin ? 'color-mix(in srgb,var(--accent) 15%,transparent)' : 'var(--surface)',
                        color: u.isAdmin ? 'var(--accent)' : 'var(--fg-muted)',
                        fontSize: '.72rem', padding: '3px 10px', borderRadius: 20, fontWeight: 500
                      }}>
                        {u.isAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '.82rem', color: 'var(--fg-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-muted)' }}>No users found.</div>}
        </div>
      )}
    </div>
  );
}
