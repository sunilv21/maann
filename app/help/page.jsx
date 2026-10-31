'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const [open, setOpen] = useState(null);

  const FAQS = [
    {
      section: 'Orders & Shipping',
      items: [
        { q: 'How long does delivery take?', a: 'Standard delivery takes 5–7 business days across India. Express delivery (2–3 days) is available for an additional fee. We ship Monday to Saturday, excluding public holidays.' },
        { q: 'When do I get free shipping?', a: 'All orders above ₹1,500 qualify for complimentary standard delivery. There are no hidden charges — the price you see at checkout is the price you pay.' },
        { q: 'Can I track my order?', a: 'Yes! Once your order is dispatched, you\'ll receive a tracking link. You can also view your order status anytime from your profile — go to My Orders in the navigation.' },
        { q: 'Do you ship internationally?', a: 'Currently we ship across India only. International shipping is coming soon — sign up for our newsletter to be notified when we launch.' },
        { q: 'What if my order is delayed?', a: "If your order hasn't arrived within the expected window, please contact us at support@maann.in with your order ID and we'll investigate immediately." },
      ],
    },
    {
      section: 'Returns & Exchanges',
      items: [
        { q: 'What is your return policy?', a: 'We offer a 7-day return policy from the date of delivery. Items must be unused, in their original packaging, and in the same condition as received. Custom or personalised pieces are non-returnable.' },
        { q: 'How do I initiate a return?', a: 'Log into your account, go to My Orders, find the delivered order, and click "Return / Exchange". Fill in the reason and submit. Our team will contact you within 24–48 hours with pickup details.' },
        { q: 'How long does a refund take?', a: 'Once we receive and inspect the returned item (usually 2–3 days after pickup), refunds are processed within 5–7 business days. Refunds go back to your original payment method.' },
        { q: 'Can I exchange for a different size?', a: 'Yes! When initiating a return, choose "Exchange" and specify the size or variant you want. Exchanges are subject to availability. If the desired variant is out of stock, we\'ll offer a full refund.' },
        { q: 'What if I received a damaged item?', a: 'We\'re so sorry if this happened. Please photograph the damage and contact us within 48 hours of delivery at support@maann.in or via the return flow in your account. We\'ll arrange a replacement or full refund immediately.' },
      ],
    },
    {
      section: 'Products & Materials',
      items: [
        { q: 'What materials do you use?', a: 'We use sterling silver (92.5%), gold vermeil (18k gold over sterling silver), brass with gold plating, and natural gemstones including cubic zirconia, freshwater pearls, and semi-precious stones. All materials are clearly listed on each product page.' },
        { q: 'How do I care for my jewellery?', a: 'Store in the provided pouch away from moisture and sunlight. Remove before swimming, bathing or exercising. Clean gently with a soft dry cloth. Avoid perfumes and chemicals directly on the piece.' },
        { q: 'Are your products hypoallergenic?', a: 'Our sterling silver pieces are generally suitable for sensitive skin. We recommend our .925 silver range if you have metal allergies. Please check the material description on each product page.' },
        { q: 'Do you offer personalisation?', a: 'Yes! Select pieces can be personalised with engraving or name charms. Look for the "Personalise" option on product pages. Personalised orders take 3–5 extra business days.' },
        { q: 'Are your gemstones real?', a: 'We use a mix of natural semi-precious stones and high-quality lab-created gems. Each product listing clearly states the type of stone used. Natural stones may have slight variations — this is the beauty of nature.' },
      ],
    },
    {
      section: 'Account & Payments',
      items: [
        { q: 'What payment methods do you accept?', a: 'We accept UPI (Google Pay, PhonePe, Paytm, BHIM), all major credit and debit cards (Visa, Mastercard, RuPay, Amex), net banking (all major banks), EMI (no-cost on select cards), digital wallets, and Cash on Delivery (COD, subject to availability).' },
        { q: 'Is my payment information secure?', a: 'Absolutely. All payments are processed through Razorpay, one of India\'s most trusted payment gateways. We never store your card or payment details on our servers. All transactions are SSL-encrypted.' },
        { q: 'Can I place an order without creating an account?', a: 'Currently an account is required to place orders so we can provide order tracking, returns and a personalised experience. Creating an account is free and takes under a minute.' },
        { q: 'How do I change my delivery address?', a: 'You can manage your saved addresses from your profile. Go to "Manage Addresses" in the navigation menu. You can add, edit, delete, and set a default address anytime.' },
        { q: 'I forgot my password. What do I do?', a: 'On the login screen, use the "Forgot Password" option to receive a reset link on your registered email. If you continue to face issues, contact us at support@maann.in.' },
      ],
    },
    {
      section: 'Gift & Special Orders',
      items: [
        { q: 'Do you offer gift wrapping?', a: 'Yes! All our orders come in beautiful branded packaging. During checkout you can add a personalised gift message at no extra charge. Premium gift boxes are available for ₹99.' },
        { q: 'Do you offer bulk or corporate orders?', a: 'Yes, we work with corporates for gifting. We offer special pricing and customisation for orders of 20+ pieces. Email us at corporate@maann.in with your requirements.' },
        { q: 'Can I buy a gift card?', a: 'Digital gift cards are coming soon! In the meantime, you can purchase specific pieces as gifts and we\'ll include a handwritten message card on request.' },
        { q: 'Do you have physical stores?', a: 'Currently Maann is an online-only brand, but we participate in select craft markets and exhibitions across major Indian cities. Follow us on Instagram for event updates.' },
        { q: 'Do you collaborate with designers or influencers?', a: 'We love collaborations! Reach out to us at hello@maann.in with your profile and a brief about the collaboration you have in mind.' },
      ],
    },
  ];

  const toggle = (key) => setOpen(o => o === key ? null : key);

  return (
    <>
      <section style={{ padding: '60px 0 40px', background: 'var(--surface)', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>Support</div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontStyle: 'italic', fontWeight: 400, marginBottom: 12 }}>Help & FAQ</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '.9rem', maxWidth: 480, margin: '0 auto' }}>Find answers to common questions below, or get in touch with our team.</p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: 760, margin: '0 auto', paddingTop: 48, paddingBottom: 60 }}>
        {FAQS.map((section) => (
          <div key={section.section} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 400, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid var(--rose)', display: 'inline-block' }}>
              {section.section}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item, idx) => {
                const key = `${section.section}-${idx}`;
                const isOpen = open === key;
                return (
                  <div key={key} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                    <button
                      onClick={() => toggle(key)}
                      style={{ width: '100%', padding: '14px 18px', background: isOpen ? 'var(--surface)' : 'var(--card)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: 'var(--font-b)', fontSize: '.9rem', color: 'var(--fg)', textAlign: 'left', fontWeight: isOpen ? 500 : 400 }}
                    >
                      <span>{item.q}</span>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: '.2s', color: 'var(--fg-muted)' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 18px 16px', fontSize: '.88rem', color: 'var(--fg-muted)', lineHeight: 1.8, background: 'var(--surface)' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '32px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 400, marginBottom: 10 }}>Still need help?</h3>
          <p style={{ color: 'var(--fg-muted)', fontSize: '.88rem', marginBottom: 22, lineHeight: 1.7 }}>
            Our customer care team is available Monday to Saturday, 10am–6pm IST.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:support@maann.in" className="btn btn-primary" style={{ padding: '11px 22px', textDecoration: 'none' }}>✉ Email Us</a>
            <a href="https://wa.me/919999999999" className="btn btn-outline" style={{ padding: '11px 22px', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          </div>
          <p style={{ color: 'var(--fg-muted)', fontSize: '.78rem', marginTop: 14 }}>We typically respond within 2–4 hours during business hours.</p>
        </div>
      </div>
    </>
  );
}
