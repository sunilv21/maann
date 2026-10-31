import Link from 'next/link';

export const metadata = {
  title: 'About Us — Maann',
  description: 'Our story: how Maann was born from a love of handcrafted jewellery and a commitment to authentic artistry.',
};

const VALUES = [
  { icon: '✦', title: 'Authenticity', desc: 'Every material we use is genuine — from sterling silver to natural gemstones. No compromises, ever.' },
  { icon: '🌿', title: 'Sustainability', desc: 'Ethically sourced materials, zero-waste packaging, and support for local artisan communities.' },
  { icon: '💎', title: 'Craftsmanship', desc: 'Each piece passes through ten skilled hands before it reaches yours. Attention to detail in every link, every setting.' },
  { icon: '❤️', title: 'Community', desc: 'Maann employs over 50 artisan families across India, preserving generational jewellery-making traditions.' },
];

const STATS = [
  { n: '15,000+', l: 'Happy Customers' },
  { n: '500+', l: 'Unique Designs' },
  { n: '50+', l: 'Artisan Families' },
  { n: '8 yrs', l: 'Of Craftsmanship' },
];

export default function AboutPage() {
  return (
    <>
      <section style={{ padding: '72px 0 60px', textAlign: 'center', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 500 }}>Our Story</div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.2, marginBottom: 20 }}>
            Born from a love of<br />timeless craft
          </h1>
          <p style={{ color: 'var(--fg-muted)', maxWidth: 560, margin: '0 auto', fontSize: '.95rem', lineHeight: 1.8 }}>
            Maann started as a dream — to create jewellery that carries meaning, made by hands that care. What began as a small workshop in Jaipur has grown into a beloved brand, yet every piece is still made the same way: slowly, with intention, and with love.
          </p>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28, maxWidth: 720, margin: '0 auto' }}>
            {STATS.map(s => (
              <div key={s.n} style={{ textAlign: 'center', padding: '28px 20px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontStyle: 'italic', color: 'var(--rose)', lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--fg-muted)', letterSpacing: '.05em', fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 500 }}>The Beginning</div>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontStyle: 'italic', fontWeight: 400, marginBottom: 20, lineHeight: 1.3 }}>
              A workshop, a dream, and a pair of earrings
            </h2>
            <div style={{ color: 'var(--fg-muted)', lineHeight: 1.9, fontSize: '.93rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p>In 2018, our founder Meena started making jewellery in her grandmother's workshop in Jaipur. What started as a hobby — a way to connect with her heritage and the craft her family had practised for generations — quickly became something more. Friends asked where she got her earrings. Strangers stopped her at markets. Orders started arriving from across India.</p>
              <p>She named the brand <em>Maann</em> — a Hindi word that captures the heart, the mind, and the self. Because she believed jewellery should speak to all three: it should be beautiful to look at, meaningful to wear, and a true expression of who you are.</p>
              <p>Today, Maann employs over 50 artisan families, ships to customers across the world, and still makes every single piece by hand. The workshop in Jaipur now has a dozen stations, but Meena still walks the floor every morning, touching each piece before it's packaged.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>What We Stand For</div>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontStyle: 'italic', fontWeight: 400 }}>Our Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 22 }}>
            {VALUES.map(v => (
              <div key={v.title} className="why-card" style={{ textAlign: 'left' }}>
                <div className="why-icon">{v.icon}</div>
                <h3 className="why-title">{v.title}</h3>
                <p className="why-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', background: 'var(--surface)' }}>
        <div className="container" style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>Our Promise</div>
          <h2 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontStyle: 'italic', fontWeight: 400, marginBottom: 18 }}>Quality you can feel</h2>
          <p style={{ color: 'var(--fg-muted)', lineHeight: 1.8, fontSize: '.93rem', marginBottom: 28 }}>
            Every Maann piece comes with a 6-month craftsmanship guarantee. If anything about your jewellery doesn't meet the standard we set, we'll replace or repair it — no questions asked. We stand behind every piece we make because we made it with our hands.
          </p>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '13px 28px' }}>Shop the Collection</Link>
        </div>
      </section>
    </>
  );
}
