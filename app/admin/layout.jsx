'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/products', label: 'Products', icon: '💎' },
  { href: '/admin/returns', label: 'Returns', icon: '↩' },
  { href: '/admin/users', label: 'Users', icon: '👤' },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontStyle: 'italic' }}>Redirecting...</div>
      <div style={{ color: 'var(--fg-muted)', fontSize: '.88rem' }}>Please sign in as an admin to access this panel.</div>
    </div>
  );

  if (!user.isAdmin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontStyle: 'italic' }}>Access Denied</div>
      <div style={{ color: 'var(--fg-muted)', fontSize: '.88rem' }}>You don't have admin privileges.</div>
      <Link href="/" style={{ color: 'var(--accent)', fontSize: '.85rem' }}>← Back to Store</Link>
    </div>
  );

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div onClick={closeSidebar} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 49,
          display: 'none'
        }} className="admin-overlay" />
      )}

      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 50, transition: 'transform .25s ease'
      }} className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <img src="/logo.png" alt="Maann" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 2 }}>Admin Panel</div>
          </div>
          <button onClick={closeSidebar} className="admin-close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4, display: 'none' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={closeSidebar} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px',
              color: pathname === item.href ? 'var(--accent)' : 'var(--fg-muted)',
              background: pathname === item.href ? 'color-mix(in srgb,var(--accent) 8%,transparent)' : 'transparent',
              borderLeft: pathname === item.href ? '3px solid var(--accent)' : '3px solid transparent',
              textDecoration: 'none', fontSize: '.88rem', fontWeight: pathname === item.href ? 500 : 400,
              transition: 'all .15s'
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <Link href="/" style={{ fontSize: '.8rem', color: 'var(--fg-muted)', textDecoration: 'none' }}>← Back to Store</Link>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh' }} className="admin-main">
        {/* Mobile top bar */}
        <div className="admin-topbar" style={{ display: 'none', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg)', padding: 4, display: 'flex' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <img src="/logo.png" alt="Maann" style={{ height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Admin</span>
        </div>
        <div style={{ padding: '28px 20px' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-overlay { display: block !important; }
          .admin-close-btn { display: flex !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
