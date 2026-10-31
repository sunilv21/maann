'use client';
import { useState, useEffect } from 'react';
import StarRating from '@/components/ui/StarRating';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Spinner from '@/components/ui/Spinner';

function maskName(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return parts[0] + ' ' + parts[parts.length - 1][0] + '.';
}

export default function ReviewSection({ productId }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      if (res.ok) { const d = await res.json(); setReviews(d.reviews || []); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [productId]);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'highest') return b.rating - a.rating;
    if (sort === 'lowest') return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const avgRating = reviews.length ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const breakdown = [5,4,3,2,1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { showToast('Please select a star rating', 'error'); return; }
    if (text.trim().length < 10) { showToast('Review must be at least 10 characters', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text: text.trim() }),
        credentials: 'include',
      });
      const d = await res.json();
      if (!res.ok) { showToast(d.error || 'Failed to submit review', 'error'); return; }
      showToast('Review submitted! Thank you.');
      setWriting(false); setRating(0); setText('');
      await load();
    } catch { showToast('Something went wrong', 'error'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete your review?')) return;
    await fetch(`/api/reviews/${productId}/${reviewId}`, { method: 'DELETE', credentials: 'include' });
    showToast('Review deleted');
    await load();
  };

  const myReview = user ? reviews.find(r => r.userId === user.id) : null;

  return (
    <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 400 }}>Reviews</h3>
        {user && !myReview && (
          <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '.75rem' }} onClick={() => setWriting(v => !v)}>
            {writing ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="rev-agg">
          <div style={{ textAlign: 'center' }}>
            <div className="rev-big-score">{avgRating}</div>
            <StarRating value={avgRating} size="sm" />
            <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)', marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="rev-bars">
            {breakdown.map(b => (
              <div key={b.n} className="rev-bar-row">
                <span style={{ minWidth: 10 }}>{b.n}</span>
                <span style={{ color: '#F59E0B', fontSize: '.9rem' }}>★</span>
                <div className="rev-bar-track">
                  <div className="rev-bar-fill" style={{ width: reviews.length ? `${(b.count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span style={{ minWidth: 18, color: 'var(--fg-muted)' }}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {writing && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '16px', marginBottom: 20 }}>
          <div style={{ marginBottom: 10, fontSize: '.8rem', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Your Rating</div>
          <StarRating value={rating} interactive onChange={setRating} size="lg" />
          <div className="ig" style={{ marginTop: 12 }}>
            <label>Your Review</label>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience (min. 10 characters)..." rows={3} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: 11 }}>
            {submitting ? <Spinner size="sm" /> : 'Submit Review'}
          </button>
        </form>
      )}

      {reviews.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--card)', color: 'var(--fg)', fontFamily: 'var(--font-b)', fontSize: '.8rem' }}>
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '20px 0' }}><Spinner /></div> : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--fg-muted)', fontSize: '.9rem' }}>No reviews yet. Be the first to review this piece.</div>
      ) : sorted.map(r => (
        <div key={r.id} className="rev-card">
          <div className="rev-meta">
            <span className="rev-name">{maskName(r.userName)}</span>
            <StarRating value={r.rating} size="sm" />
            <span className="rev-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {r.verified && <span className="rev-verified">Verified Purchase</span>}
            {user && r.userId === user.id && (
              <button onClick={() => handleDelete(r.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '.75rem', fontFamily: 'var(--font-b)' }}>Delete</button>
            )}
          </div>
          <p className="rev-text">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
