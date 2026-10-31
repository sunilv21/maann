'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/product/ProductGrid';
import { useModal } from '@/context/ModalContext';

const CATS = [
  { id: 'necklace', label: 'Necklaces', img: '/necklace.jpg', desc: 'Delicate chains and statement pieces' },
  { id: 'earring',  label: 'Earrings',  img: '/earings.jpg',  desc: 'Hoops, studs, drops and chandeliers' },
  { id: 'bracelet', label: 'Bracelets', img: '/bracelet.jpg', desc: 'Bangles, cuffs and charm bracelets' },
];

const WHY = [
  { icon: '✦', title: 'Handcrafted', desc: 'Every piece is individually crafted by skilled artisans with decades of expertise.' },
  { icon: '🌿', title: 'Sustainable', desc: 'We use ethically sourced materials and eco-friendly packaging to protect our planet.' },
  { icon: '💎', title: 'Authentic', desc: 'Certified genuine materials — sterling silver, gold vermeil, and natural gemstones.' },
  { icon: '🚚', title: 'Free Shipping', desc: 'Complimentary delivery on all orders above ₹1,500, with express options available.' },
];

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    fetch('/api/products?sort=newest&limit=4')
      .then(r => r.json())
      .then(d => setNewArrivals(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">New Collection 2026</div>
          <h1 className="hero-title">Where Elegance<br />Meets Artistry</h1>
          <p className="hero-sub">Handcrafted jewellery that tells your story. Each piece is uniquely made with love, intention, and the finest materials.</p>
          <div className="hero-acts">
            <Link href="/shop" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '.88rem' }}>Explore Collection</Link>
            <Link href="/about" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '.88rem' }}>Our Story</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">Shop by Category</div>
            <h2 className="section-title">Find Your Perfect Piece</h2>
          </div>
          <div className="cat-grid">
            {CATS.map(c => (
              <Link key={c.id} href={`/shop?category=${c.id}`} className="cat-card">
                <div className="cat-img-wrap">
                  <img src={c.img} alt={c.label} className="cat-img" />
                </div>
                <div className="cat-name">{c.label}</div>
                <div className="cat-desc">{c.desc}</div>
                <div className="cat-cta">Shop Now →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: 32 }}>
            <div className="section-eyebrow">Just Arrived</div>
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <ProductGrid products={newArrivals} loading={loading} />
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/shop" className="btn btn-outline" style={{ padding: '13px 32px', fontSize: '.88rem' }}>View All Pieces</Link>
          </div>
        </div>
      </section>

      <section className="section why-section">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">Why Choose Maann</div>
            <h2 className="section-title">Crafted with Intention</h2>
          </div>
          <div className="why-grid">
            {WHY.map(w => (
              <div key={w.title} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <h3 className="why-title">{w.title}</h3>
                <p className="why-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <div className="featured-inner">
            <div>
              <div className="section-eyebrow">Featured Collection</div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>The Bride's Glow<br />Collection</h2>
              <p style={{ color: 'var(--fg-muted)', lineHeight: 1.8, marginBottom: 24, fontSize: '.95rem', maxWidth: 400 }}>
                Specially curated for your most precious moments. From delicate necklaces to statement earrings, every piece is designed to make you shine.
              </p>
              <Link href="/shop" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '.88rem' }}>Shop Bridal Collection</Link>
            </div>
            <div className="featured-visual">
              <div className="featured-gems">
                {['✦', '◇', '✧', '◈', '✦'].map((g, i) => (
                  <span key={i} className="gem" style={{ animationDelay: `${i * 0.4}s` }}>{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--rose)', paddingTop: 50, paddingBottom: 50 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 12, fontWeight: 500 }}>Limited Time</div>
          <h2 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontStyle: 'italic', fontWeight: 400, color: '#fff', marginBottom: 12 }}>
            Free Shipping on Your First Order
          </h2>
          <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: 24, fontSize: '.9rem' }}>Use code MAANN10 at checkout and enjoy complimentary delivery.</p>
          <Link href="/shop" className="btn" style={{ background: '#fff', color: 'var(--rose)', padding: '13px 28px', fontSize: '.88rem', fontWeight: 500 }}>
            Shop Now
          </Link>
        </div>
      </section>
    </>
  );
}
