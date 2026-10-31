'use client';
import { adminFetch } from '@/lib/adminFetch';
import { registerAdminRefresh } from '@/lib/adminRefresh';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProductSvg from '@/components/product/ProductSvg';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await adminFetch('/api/admin/products');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Could not load products (${response.status})`);
      if (!Array.isArray(data)) throw new Error('The products API returned an unexpected response.');
      setProducts(data);
    } catch (error) {
      setLoadError(error.message || 'Could not load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => registerAdminRefresh(loadProducts), [loadProducts]);

  async function deleteProduct(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  const fmt = n => '₹' + (n || 0).toLocaleString('en-IN');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic' }}>Products</h1>
        <Link href="/admin/products/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--r)', textDecoration: 'none', fontSize: '.82rem', fontWeight: 500 }}>+ Add Product</Link>
      </div>

      {loading ? <div style={{ color: 'var(--fg-muted)' }}>Loading products...</div> : loadError ? (
        <div role="alert" style={{ padding: 24, border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)' }}>
          <div>{loadError}</div>
          <button onClick={loadProducts} style={{ marginTop: 12, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, aspectRatio: '4/3' }}>
                <ProductSvg svgKey={p.svg_key} imageUrl={p.image_url} size={100} />
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 2 }}>{p.category}</div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 8 }}>
                  {fmt(p.sale_price || p.price)}
                  {p.sale_price && p.sale_price < p.price && (
                    <>
                      <span style={{ marginLeft: 8, color: 'var(--fg-muted)', fontSize: '.82rem', textDecoration: 'line-through', fontWeight: 400 }}>{fmt(p.price)}</span>
                      <span style={{ marginLeft: 8, color: 'var(--danger)', fontSize: '.7rem', fontWeight: 600 }}>
                        {Math.round(((p.price - p.sale_price) / p.price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)', marginBottom: 10 }}>
                  {p.product_variants?.length || 0} variant{(p.product_variants?.length || 0) !== 1 ? 's' : ''} · Stock: {p.stock}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/admin/products/${p.id}/edit`} style={{ flex: 1, textAlign: 'center', padding: '7px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, textDecoration: 'none', color: 'var(--fg)', fontSize: '.78rem' }}>Edit</Link>
                  <button onClick={() => deleteProduct(p.id, p.name)} disabled={deleting === p.id}
                    style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid var(--danger)', borderRadius: 6, color: 'var(--danger)', fontSize: '.78rem', cursor: 'pointer' }}>
                    {deleting === p.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !loadError && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--fg-muted)' }}>
          No products yet. <Link href="/admin/products/new" style={{ color: 'var(--accent)' }}>Add the first one →</Link>
        </div>
      )}
    </div>
  );
}
