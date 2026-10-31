'use client';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';
import { useAuth } from '@/context/AuthContext';
import ProductSvg from '@/components/product/ProductSvg';
import Spinner from '@/components/ui/Spinner';
import { getDiscountPercent, getProductPrice } from '@/lib/productPricing';

const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

export default function CartSidebar() {
  const { items, cartCount, subtotal, shipping, cartTotal, updateQty, removeItem, loading } = useCart();
  const { activeModal, openModal, closeModal } = useModal();
  const { user } = useAuth();
  const isOpen = activeModal === 'cart';

  const handleCheckout = () => {
    closeModal('cart');
    if (!user) { openModal('auth'); return; }
    openModal('checkout');
  };

  return (
    <>
      {isOpen && <div className="modal-overlay" style={{ zIndex: 200 }} onClick={() => closeModal('cart')} />}
      <div className={`cart-sidebar${isOpen ? ' open' : ''}`} style={{ zIndex: 201 }}>
        <div className="cart-head">
          <span>Your Bag ({cartCount})</span>
          <button className="xbtn" onClick={() => closeModal('cart')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="cart-items">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spinner /></div>
          ) : items.length === 0 ? (
            <div className="empty" style={{ padding: '60px 0' }}>
              <div className="empty-ico">🛍️</div>
              <h3>Your bag is empty</h3>
              <p>Add some beautiful pieces to get started.</p>
              <button className="btn btn-primary" onClick={() => { closeModal('cart'); openModal('shop'); }} style={{ marginTop: 12 }}>
                Browse Collection
              </button>
            </div>
          ) : items.map(item => (
            <div key={`${item.product_id}-${item.variant}`} className="ci">
              <div className="ci-img">
                <ProductSvg svgKey={item.product?.svgKey} size={52} />
              </div>
              <div className="ci-info">
                <div className="ci-name">{item.product?.name}</div>
                {item.variant && <div className="ci-var">{item.variant}</div>}
                <div className="ci-price">
                  <span className="price-highlight">
                    {fmt(getProductPrice(item.product) * item.qty)}
                  </span>
                  {getDiscountPercent(item.product) > 0 && (
                    <span style={{ marginLeft: 6, color: 'var(--fg-muted)', textDecoration: 'line-through', fontSize: '.76rem' }}>{fmt(item.product.price * item.qty)}</span>
                  )}
                </div>
              </div>
              <div className="ci-ctrl">
                <div className="qc" style={{ zoom: '.85' }}>
                  <button className="qb" onClick={() => item.qty > 1 ? updateQty(item.product_id, item.variant, item.qty - 1) : removeItem(item.product_id, item.variant)}>−</button>
                  <span className="qn">{item.qty}</span>
                  <button className="qb" onClick={() => updateQty(item.product_id, item.variant, item.qty + 1)}>+</button>
                </div>
                <button className="ib" style={{ color: 'var(--fg-muted)' }} onClick={() => removeItem(item.product_id, item.variant)}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="cart-foot">
            <div className="cart-sums">
              <div className="cs-row"><span>Subtotal</span><span className="price-highlight">{fmt(subtotal)}</span></div>
              <div className="cs-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : <span className="price-highlight">{fmt(shipping)}</span>}</span></div>
              {shipping > 0 && (
                <div style={{ fontSize: '.72rem', color: 'var(--fg-muted)', textAlign: 'right' }}>
                  Add <span className="price-highlight">{fmt(1500 - subtotal)}</span> more for free shipping
                </div>
              )}
              <div className="cs-row total"><span>Total</span><span className="price-highlight">{fmt(cartTotal)}</span></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', padding: 10, fontSize: '.8rem' }} onClick={() => closeModal('cart')}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
