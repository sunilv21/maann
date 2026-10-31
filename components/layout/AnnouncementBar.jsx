'use client';
import { useState, useEffect } from 'react';

const MESSAGES = [
  '✦ Free shipping on all orders above ₹1,500',
  '✦ Easy 7-day returns & exchanges',
  '✦ Authentic materials · Secure payments',
];

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ann-bar">
      <span className={`ann-msg${visible ? '' : ' hidden'}`}>{MESSAGES[idx]}</span>
    </div>
  );
}
