'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { authFetch } from '@/lib/authFetch';
import ProductCard from '@/components/product/ProductCard';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { openModal } = useModal();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    authFetch('/api/wishlist')
      .then(r => r.ok ? r.json() : [])
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>♡</div>
        <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '1.8rem', fontStyle: 'italic', fontWeight: 400, marginBottom: 10 }}>Your Wishlist</h2>
        <p style={{ color: 'var(--fg-muted)', marginBottom: 22, fontSize: '.9rem' }}>Sign in to save your favourite pieces.</p>
        <button className="btn btn-primary" style={{ padding: '12px 28px' }} onClick={() => openModal('auth')}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 60, minHeight: '60vh' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6, fontWeight: 500 }}>Your Wishlist</div>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontStyle: 'italic', fontWeight: 400 }}>
          Saved Pieces
        </h1>
        {products.length > 0 && (
          <p style={{ color: 'var(--fg-muted)', marginTop: 6, fontSize: '.88rem' }}>{products.length} piece{products.length !== 1 ? 's' : ''} saved</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">♡</div>
          <h3>Nothing saved yet</h3>
          <p>Browse our collection and tap the heart to save pieces you love.</p>
          <Link href="/shop" className="btn btn-primary" style={{ marginTop: 16, padding: '11px 24px' }}>Browse Collection</Link>
        </div>
      ) : (
        <div className="pg">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              initialWishlisted={true}
              onWishlistChange={(id, wishlisted) => {
                if (!wishlisted) setProducts(prev => prev.filter(x => x.id !== id));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
