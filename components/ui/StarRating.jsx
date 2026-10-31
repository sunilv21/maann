'use client';
import { useState } from 'react';

export default function StarRating({ value = 0, interactive = false, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const fontSize = size === 'sm' ? '0.9rem' : size === 'lg' ? '1.6rem' : '1.1rem';

  if (!interactive) {
    return (
      <span className="stars-display" style={{ fontSize, letterSpacing: '.02em' }}>
        {[1, 2, 3, 4, 5].map(i => {
          if (value >= i) return <span key={i}>★</span>;
          if (value >= i - 0.5) return <span key={i}>⯨</span>;
          return <span key={i} style={{ opacity: .35 }}>★</span>;
        })}
      </span>
    );
  }

  return (
    <div className="star-select">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          className={`star-btn${(hover || value) >= i ? ' sel' : ''}`}
          style={{ fontSize }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange?.(i)}
        >★</button>
      ))}
    </div>
  );
}
