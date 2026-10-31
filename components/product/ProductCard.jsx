'use client';
import { useState } from 'react';
import ProductSvg from './ProductSvg';
import StarRating from '@/components/ui/StarRating';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/context/ToastContext';
import { getDiscountPercent, getProductPrice } from '@/lib/productPricing';
import { authFetch } from '@/lib/authFetch';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

export default function ProductCard({ product, onWishlistChange, initialWishlisted = false }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wloading, setWloading] = useState(false);
  const currentPrice = getProductPrice(product);
  const discountPercent = getDiscountPercent(product);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) { openModal('auth'); return; }
    setWloading(true);
    try {
      const res = await authFetch(`/api/wishlist/${product.id}`, { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        setWishlisted(d.wishlisted);
        showToast(d.wishlisted ? 'Saved to wishlist ♡' : 'Removed from wishlist');
        if (onWishlistChange) onWishlistChange(product.id, d.wishlisted);
      }
    } catch {} finally { setWloading(false); }
  };

  const handleAddCart = async (e) => {
    e.stopPropagation();
    if (!user) { openModal('auth'); return; }
    const defaultVariant = product.variants?.[0]?.value || null;
    const result = await addItem(product.id, 1, defaultVariant);
    if (result?.error === 'login') { openModal('auth'); return; }
    showToast('Added to bag ✓');
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (!user) { openModal('auth'); return; }
    openModal('product', { ...product, buyNow: true });
  };

  return (
    <div className="pc" role="button" tabIndex={0} onClick={() => openModal('product', product)} onKeyDown={e => e.key === 'Enter' && openModal('product', product)}>
      <div className="pc-img">
        <ProductSvg svgKey={product.svgKey || product.svg_key} imageUrl={product.imageUrl || product.image_url} size={120} />
        {discountPercent > 0 && <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 8px', borderRadius: 20, background: 'var(--danger)', color: '#fff', fontSize: '.68rem', fontWeight: 600 }}>{discountPercent}% OFF</span>}
      </div>
      <button className={`wbtn${wishlisted ? ' on' : ''}`} onClick={handleWishlist} disabled={wloading} aria-label="Wishlist">
        <svg width="13" height="13" fill={wishlisted ? 'var(--danger)' : 'none'} stroke={wishlisted ? 'var(--danger)' : 'currentColor'} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div className="pc-body">
        <div className="pc-cat">{product.category}</div>
        <div className="pc-name">{product.name}</div>
        <div className="pc-price">
          <span className="price-highlight">{fmt(currentPrice)}</span>
          {discountPercent > 0 && <span style={{ marginLeft: 8, color: 'var(--fg-muted)', fontSize: '.82rem', textDecoration: 'line-through', fontWeight: 400 }}>{fmt(product.price)}</span>}
        </div>
        <div className="pc-stars">
          <StarRating value={product.avgRating || 0} size="sm" />
          <span>({product.reviewCount || 0})</span>
        </div>
      </div>
      <div className="pc-foot">
        <button className="btn btn-outline" onClick={handleAddCart}>Add to Bag</button>
        <button className="btn btn-primary" onClick={handleBuyNow}>Buy Now</button>
      </div>
    </div>
  );
}
