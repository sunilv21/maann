'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.includes('@')) { showToast('Please enter a valid email', 'error'); return; }
    showToast('Thanks for subscribing! ✦', 'success');
    setEmail('');
  };

  return (
    <footer>
      <div className="foot-inner">
        <div className="foot-top">
          <div>
            <div className="foot-logo">Ma<span style={{ color: 'var(--rose)' }}>a</span>nn</div>
            <p className="foot-tagline">Jewellery crafted with love, delivered to your door.</p>
            <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
              {['M 4 4 h 16 v 12 H 4 Z M 4 4 l 8 8 8-8', 'M 23 3 a 10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z'].map((d, i) => (
                <button key={i} className="ib" style={{ color: 'var(--fg-muted)' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d={d} /></svg>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/help">Help & FAQ</Link>
            <Link href="/help">Returns</Link>
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
          </div>
          <div>
            <h4>Categories</h4>
            <Link href="/shop?category=necklace">Necklaces</Link>
            <Link href="/shop?category=earring">Earrings</Link>
            <Link href="/shop?category=bracelet">Bracelets</Link>
            <Link href="/shop">New Arrivals</Link>
            <Link href="/shop">Best Sellers</Link>
          </div>
          <div>
            <h4>Stay in the loop</h4>
            <p style={{ fontSize: '.82rem', color: 'var(--fg-muted)', marginBottom: 12, lineHeight: 1.6 }}>Get early access to new collections & exclusive offers.</p>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              <button type="submit" className="btn btn-primary" style={{ padding: '9px 14px', fontSize: '.76rem', flexShrink: 0 }}>Subscribe</button>
            </form>
          </div>
        </div>
        <div className="foot-bottom">
          <div className="foot-pills">
            <span>✦ Free Shipping ₹1,500+</span>
            <span>✦ Easy 7-day Returns</span>
            <span>✦ Authentic Materials</span>
            <span>✦ Secure Payments</span>
          </div>
          <span className="foot-copy">© 2026 Maann. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
