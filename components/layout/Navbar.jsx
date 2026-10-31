'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';
import { authFetch } from '@/lib/authFetch';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { openModal } = useModal();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wishCount, setWishCount] = useState(0);
  const searchRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!user) { setWishCount(0); return; }
    authFetch('/api/wishlist')
      .then(r => r.ok ? r.json() : [])
      .then(d => setWishCount(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Necklaces', href: '/shop?category=necklace' },
    { label: 'Earrings', href: '/shop?category=earring' },
    { label: 'Bracelets', href: '/shop?category=bracelet' },
    { label: 'About', href: '/about' },
    { label: 'Help', href: '/help' },
  ];

  return (
    <>
      <nav className="nav" role="navigation">
        <div className="nav-in">
          <Link href="/" className="logo">Ma<span className="logo-accent">a</span>nn</Link>
          <ul className="nav-links">
            {navLinks.map(l => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
          <div className="nav-acts">
            <div className="nav-search-wrap">
              <form onSubmit={handleSearch}>
                <input
                  ref={searchRef}
                  className={`nav-search-input${searchOpen ? ' open' : ''}`}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search jewellery…"
                  aria-label="Search"
                />
              </form>
              <button className="ib" onClick={() => setSearchOpen(v => !v)} aria-label="Search">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
            <button className="ib" onClick={() => user ? router.push('/wishlist') : openModal('auth')} title="Wishlist" aria-label="Wishlist">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishCount > 0 && <span className="badge">{wishCount}</span>}
            </button>
            <button className="ib" onClick={() => openModal('cart')} title="Cart" aria-label="Cart">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            {!user ? (
              <>
                <button className="btn btn-outline nav-login-btn" onClick={() => openModal('auth')} style={{ padding: '7px 14px', fontSize: '.78rem' }}>Login</button>
                <button className="ib nav-user-icon" onClick={() => openModal('auth')} aria-label="Sign in">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
              </>
            ) : (
              <div style={{ position: 'relative' }} ref={dropRef}>
                <button className="ib nav-user-btn" onClick={() => setDropOpen(v => !v)} aria-label="Account">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                </button>
                {dropOpen && (
                  <div className="u-drop">
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{user.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)' }}>{user.email}</div>
                      {user.phone && <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)' }}>{user.phone}</div>}
                    </div>
                    <button className="u-drop-item" onClick={() => { setDropOpen(false); openModal('orders'); }}>My Orders</button>
                    <button className="u-drop-item" onClick={() => { setDropOpen(false); openModal('addresses'); }}>Manage Addresses</button>
                    {user.isAdmin && (
                      <button className="u-drop-item" onClick={() => { setDropOpen(false); router.push('/admin'); }} style={{ color: 'var(--accent)' }}>Admin Panel</button>
                    )}
                    <button className="u-drop-item" onClick={() => { setDropOpen(false); logout(); }}>Logout</button>
                  </div>
                )}
              </div>
            )}
            <button className="ib" onClick={() => setMobileOpen(true)} style={{ display: 'none' }} id="mob-btn" aria-label="Menu">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="mob-menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" className="logo" onClick={() => setMobileOpen(false)}>Ma<span className="logo-accent">a</span>nn</Link>
            <button className="xbtn" onClick={() => setMobileOpen(false)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="mob-menu-links">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</Link>
            ))}
            {!user
              ? <a onClick={() => { setMobileOpen(false); openModal('auth'); }}>Login / Register</a>
              : <a onClick={() => { setMobileOpen(false); logout(); }}>Logout</a>
            }
          </div>
        </div>
      )}
      <style>{`
        @media(max-width:768px){
          #mob-btn{display:flex!important}
          .nav-login-btn{display:none!important}
          .nav-user-icon{display:inline-flex!important}
          .nav-user-name{display:none!important}
          .nav-user-btn{padding:0!important;background:none!important;border-radius:0!important;gap:0!important}
        }
        @media(min-width:769px){
          .nav-user-icon{display:none!important}
          .nav-user-name{display:inline!important;font-size:.82rem;font-weight:500;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
          .nav-user-btn{border-radius:20px!important;padding:6px 12px!important;gap:6px!important;background:var(--surface)!important;}
        }
      `}</style>
    </>
  );
}
