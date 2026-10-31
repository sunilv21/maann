'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SVG_KEYS = ['n1', 'n2', 'n3', 'n4', 'n5', 'e1', 'e2', 'e3', 'e4', 'e5', 'b1', 'b2', 'b3', 'b4', 'b5'];

const fieldStyle = {
  width: '100%', padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--r)', color: 'var(--fg)', fontFamily: 'var(--font-b)', fontSize: '.92rem',
  outline: 'none', boxSizing: 'border-box'
};

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', category: 'necklace', price: '', salePrice: '', description: '', material: '', svgKey: 'n1', stock: '50' });
  const [variants, setVariants] = useState([{ label: '16 inch', value: '16"' }, { label: '18 inch', value: '18"' }, { label: '20 inch', value: '20"' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleCategoryChange(cat) {
    set('category', cat);
    if (cat === 'necklace') setVariants([{ label: '16 inch', value: '16"' }, { label: '18 inch', value: '18"' }, { label: '20 inch', value: '20"' }]);
    else if (cat === 'earring') setVariants([{ label: 'Standard', value: 'standard' }]);
    else if (cat === 'bracelet') setVariants([{ label: 'S (6 inch)', value: 'S' }, { label: 'M (7 inch)', value: 'M' }, { label: 'L (8 inch)', value: 'L' }]);
  }

  function addVariant() { setVariants(v => [...v, { label: '', value: '' }]); }
  function removeVariant(i) { setVariants(v => v.filter((_, j) => j !== i)); }
  function setVariant(i, k, v) { setVariants(prev => prev.map((item, j) => j === i ? { ...item, [k]: v } : item)); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    if (form.salePrice && Number(form.salePrice) >= Number(form.price)) { setError('Sale price must be lower than the regular price'); return; }
    setSaving(true); setError('');
    const res = await adminFetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseInt(form.price), salePrice: form.salePrice ? parseInt(form.salePrice) : null, stock: parseInt(form.stock) || 50, variants: variants.filter(v => v.label) })
    });
    if (res.ok) { router.push('/admin/products'); }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); setSaving(false); }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push('/admin/products')} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: '.85rem' }}>← Products</button>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic' }}>Add New Product</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Pearl Pendant" required style={fieldStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Category *</label>
              <select value={form.category} onChange={e => handleCategoryChange(e.target.value)} style={fieldStyle}>
                <option value="necklace">Necklace</option>
                <option value="earring">Earring</option>
                <option value="bracelet">Bracelet</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Regular Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="1299" min="1" required style={fieldStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Sale Price (₹, optional)</label>
              <input type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} placeholder="Leave blank for no discount" min="1" style={fieldStyle} />
            </div>
          </div>

          <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Stock</label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="50" min="0" style={fieldStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe this piece..." rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Material</label>
            <input value={form.material} onChange={e => set('material', e.target.value)} placeholder="Rose Gold Plated · Freshwater Pearl" style={fieldStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>SVG Illustration</label>
            <select value={form.svgKey} onChange={e => set('svgKey', e.target.value)} style={fieldStyle}>
              {SVG_KEYS.map(k => <option key={k} value={k}>{k} ({k[0] === 'n' ? 'Necklace' : k[0] === 'e' ? 'Earring' : 'Bracelet'} #{k.slice(1)})</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 500 }}>Variants</div>
            {variants.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input value={v.label} onChange={e => setVariant(i, 'label', e.target.value)} placeholder="Label (e.g. 18 inch)"
                  style={{ flex: 2, padding: '7px 11px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--fg)', fontSize: '.88rem', outline: 'none' }} />
                <input value={v.value} onChange={e => setVariant(i, 'value', e.target.value)} placeholder="Value (e.g. 18&quot;)"
                  style={{ flex: 1, padding: '7px 11px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--fg)', fontSize: '.88rem', outline: 'none' }} />
                <button type="button" onClick={() => removeVariant(i)}
                  style={{ background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', flexShrink: 0, fontSize: '1rem' }}>×</button>
              </div>
            ))}
            <button type="button" onClick={addVariant}
              style={{ background: 'none', border: '1px dashed var(--border)', color: 'var(--fg-muted)', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: '.8rem', marginTop: 4 }}>
              + Add Variant
            </button>
          </div>

          {error && <div style={{ color: 'var(--danger)', fontSize: '.85rem', background: 'color-mix(in srgb,var(--danger) 10%,transparent)', padding: '10px 14px', borderRadius: 6 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: 12, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontFamily: 'var(--font-b)', fontWeight: 500, cursor: 'pointer', fontSize: '.88rem' }}>
              {saving ? 'Saving...' : 'Add Product'}
            </button>
            <button type="button" onClick={() => router.push('/admin/products')}
              style={{ padding: '12px 20px', background: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'pointer', fontSize: '.88rem' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
