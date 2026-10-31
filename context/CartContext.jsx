'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { authFetch } from '@/lib/authFetch';
import { getProductPrice } from '@/lib/productPricing';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const res = await authFetch('/api/cart');
      if (res.ok) { const d = await res.json(); setItems(d.items || []); }
    } catch {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const addItem = useCallback(async (productId, qty = 1, variant = null) => {
    if (!user) return { error: 'login' };
    const res = await authFetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty, variant }),
    });
    if (res.ok) await loadCart();
    return res.ok ? {} : { error: 'Failed' };
  }, [user, loadCart]);

  const updateQty = useCallback(async (productId, variant, qty) => {
    if (!user) return;
    await authFetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty, variant }),
    });
    await loadCart();
  }, [user, loadCart]);

  const removeItem = useCallback(async (productId, variant) => {
    if (!user) return;
    await authFetch(`/api/cart/${productId}`, { 
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant }),
    });
    await loadCart();
  }, [user, loadCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await authFetch('/api/cart', { method: 'DELETE' });
    setItems([]);
  }, [user]);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + getProductPrice(i.product) * i.qty, 0);
  const shipping = subtotal > 0 && subtotal < 1500 ? 99 : 0;
  const cartTotal = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items, loading, cartCount, subtotal, shipping, cartTotal, addItem, updateQty, removeItem, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
