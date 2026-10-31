'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';

const CATS = [
  { id: '', label: 'All' },
  { id: 'necklace', label: 'Necklaces' },
  { id: 'earring', label: 'Earrings' },
  { id: 'bracelet', label: 'Bracelets' },
];

const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [inputVal, setInputVal] = useState(search);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    setSearch(q); setInputVal(q); setCategory(cat);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputVal);
  };

  const setcat = (c) => {
    setCategory(c);
    const p = new URLSearchParams(searchParams);
    if (c) p.set('category', c); else p.delete('category');
    router.push(`/shop?${p}`);
  };

  return (
    <>
      <div className="shop-hero">
        <div className="container" style={{ textAlign: 'center', paddingTop: 30, paddingBottom: 24 }}>
          <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>Our Collection</div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontStyle: 'italic', fontWeight: 400, marginBottom: 10 }}>
            Discover Maann
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '.9rem', maxWidth: 480, margin: '0 auto 20px' }}>
            {products.length > 0 && !loading ? `${products.length} pieces` : 'Explore our'} handcrafted jewellery collection
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto' }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Search necklaces, earrings, bracelets…"
              style={{ flex: 1, padding: '11px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: 'var(--fg)', fontFamily: 'var(--font-b)', fontSize: '.88rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '11px 18px', flexShrink: 0 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div className="cat-bar">
            {CATS.map(c => (
              <button key={c.id} className={`cb${category === c.id ? ' active' : ''}`} onClick={() => setcat(c.id)}>{c.label}</button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: 'var(--fg)', fontFamily: 'var(--font-b)', fontSize: '.82rem', cursor: 'pointer' }}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {search && (
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.85rem', color: 'var(--fg-muted)' }}>Results for "{search}"</span>
            <button className="btn btn-ghost" style={{ fontSize: '.75rem', padding: '3px 8px' }} onClick={() => { setSearch(''); setInputVal(''); }}>Clear ×</button>
          </div>
        )}

        <ProductGrid products={products} loading={loading} />
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--fg-muted)' }}>Loading…</div>}>
      <ShopContent />
    </Suspense>
  );
}
