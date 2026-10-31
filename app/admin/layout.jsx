'use client';
import { useEffect } from 'react';
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <img src="/logo.png" alt="Maann" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <div style={{ fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 2 }}>Admin Panel</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
              color: pathname === item.href ? 'var(--accent)' : 'var(--fg-muted)',
              background: pathname === item.href ? 'color-mix(in srgb,var(--accent) 8%,transparent)' : 'transparent',
              borderLeft: pathname === item.href ? '3px solid var(--accent)' : '3px solid transparent',
              textDecoration: 'none', fontSize: '.88rem', fontWeight: pathname === item.href ? 500 : 400,
              transition: 'all .15s'
            }}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <Link href="/" style={{ fontSize: '.8rem', color: 'var(--fg-muted)', textDecoration: 'none' }}>← Back to Store</Link>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: 220, padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
