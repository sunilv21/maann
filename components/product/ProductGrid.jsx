'use client';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="pg">
        {[1,2,3,4].map(i => (
          <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div className="skeleton" style={{ aspectRatio: '4/3' }} />
            <div style={{ padding: '14px' }}>
              <div className="skeleton" style={{ height: 10, borderRadius: 4, marginBottom: 8, width: '40%' }} />
              <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 6, width: '80%' }} />
              <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '30%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="empty">
        <div className="empty-ico">💎</div>
        <h3>No pieces found</h3>
        <p>Try a different search or category.</p>
      </div>
    );
  }

  return (
    <div className="pg">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
