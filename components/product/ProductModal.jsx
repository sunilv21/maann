'use client';
import { useState, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductSvg from './ProductSvg';
import StarRating from '@/components/ui/StarRating';
import ReviewSection from '@/components/reviews/ReviewSection';
import Spinner from '@/components/ui/Spinner';
import { authFetch } from '@/lib/authFetch';
import { getDiscountPercent, getProductPrice } from '@/lib/productPricing';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

export default function ProductModal() {
  const { activeModal, modalData, closeModal, openModal } = useModal();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const isOpen = activeModal === 'product';
  const currentPrice = getProductPrice(product);
  const discountPercent = getDiscountPercent(product);

  useEffect(() => {
    if (!isOpen || !modalData?.id) return;
    setLoading(true);
    setQty(1);
    fetch(`/api/products/${modalData.id}`)
      .then(r => r.json())
      .then(d => {
        setProduct(d);
        setVariant(d?.product_variants?.[0]?.value || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, modalData?.id]);

  useEffect(() => {
    if (!isOpen) { setProduct(null); }
  }, [isOpen]);

  const handleAddCart = async () => {
    if (!user) { openModal('auth'); return; }
    const r = await addItem(product.id, qty, variant);
    if (r?.error === 'login') { openModal('auth'); return; }
    showToast('Added to bag ✓');
    closeModal('product');
  };

  const handleBuyNow = async () => {
    if (!user) { openModal('auth'); return; }
    const r = await addItem(product.id, qty, variant);
    if (r?.error) { openModal('auth'); return; }
    closeModal('product');
    openModal('checkout');
  };

  const handleWishlist = async () => {
    if (!user) { openModal('auth'); return; }
    const res = await authFetch(`/api/wishlist/${product.id}`, { method: 'POST' });
    if (res.ok) {
      const d = await res.json();
      setWishlisted(d.wishlisted);
      showToast(d.wishlisted ? 'Saved to wishlist ♡' : 'Removed from wishlist');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => closeModal('product')}>
      <div className="modal-box xl" onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-head" style={{ paddingBottom: 0 }}>
          <div />
          <button className="xbtn" onClick={() => closeModal('product')}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {loading || !product ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="pm-layout">
              <div className="pm-img">
                {(product.imageUrl || product.image_url)
                  ? <img src={product.imageUrl || product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ProductSvg svgKey={product.svgKey || product.svg_key} size={180} /></div>
                }
              </div>
              <div className="pm-info">
                <div className="pm-cat">{product.category}</div>
                <div className="pm-name">{product.name}</div>
                <div className="pm-price">
                  <span className="price-highlight">{fmt(currentPrice)}</span>
                  {discountPercent > 0 && (
                    <>
                      <span style={{ marginLeft: 10, color: 'var(--fg-muted)', fontSize: '.9rem', textDecoration: 'line-through', fontWeight: 400 }}>{fmt(product.price)}</span>
                      <span style={{ marginLeft: 8, color: 'var(--danger)', fontSize: '.78rem', fontFamily: 'var(--font-b)', fontStyle: 'normal' }}>{discountPercent}% OFF</span>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating value={product.avgRating || 0} />
                  <span style={{ fontSize: '.82rem', color: 'var(--fg-muted)' }}>{product.reviewCount || 0} review{product.reviewCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="pm-desc">{product.description}</div>
                <div className="pm-mat"><strong style={{ fontWeight: 500 }}>Material:</strong> {product.material}</div>
                {product.product_variants?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '.73rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>Size</div>
                    <div className="variant-group">
                      {product.product_variants.map(v => (
                        <button key={v.id} className={`variant-btn${variant === v.value ? ' sel' : ''}`} onClick={() => setVariant(v.value)}>{v.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="qty-row">
                  <span className="qty-label">Qty</span>
                  <div className="qc">
                    <button className="qb" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="qn">{qty}</span>
                    <button className="qb" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
                  </div>
                </div>
                <div className="pm-acts">
                  <button className="btn btn-primary" style={{ padding: 12 }} onClick={handleAddCart}>Add to Bag — {fmt(currentPrice * qty)}</button>
                  <button className="btn btn-outline" style={{ padding: 12 }} onClick={handleBuyNow}>Buy Now</button>
                  <button className="btn btn-ghost" style={{ fontSize: '.76rem', gap: 5 }} onClick={handleWishlist}>
                    <svg width="13" height="13" fill={wishlisted ? 'var(--danger)' : 'none'} stroke={wishlisted ? 'var(--danger)' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: '0 22px 22px' }}>
              <ReviewSection productId={product.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
