'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const SVG_KEYS = ['n1', 'n2', 'n3', 'n4', 'n5', 'e1', 'e2', 'e3', 'e4', 'e5', 'b1', 'b2', 'b3', 'b4', 'b5'];

const fieldStyle = {
  width: '100%', padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--r)', color: 'var(--fg)', fontFamily: 'var(--font-b)', fontSize: '.92rem',
  outline: 'none', boxSizing: 'border-box'
};

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', category: 'necklace', price: '', salePrice: '', description: '', material: '', svgKey: 'n1', stock: '50' });
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    adminFetch(`/api/admin/products/${id}`).then(r => r.json()).then(p => {
      setForm({
        name: p.name || '',
        category: p.category || 'necklace',
        price: p.price || '',
        salePrice: p.sale_price ?? '',
        description: p.description || '',
        material: p.material || '',
        svgKey: p.svg_key || 'n1',
        stock: p.stock ?? 50
      });
      setVariants(p.product_variants?.map(v => ({ label: v.label, value: v.value })) || []);
      setImageUrl(p.image_url || '');
      setImagePreview(p.image_url || '');
      setLoading(false);
    });
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  function addVariant() { setVariants(v => [...v, { label: '', value: '' }]); }
  function removeVariant(i) { setVariants(v => v.filter((_, j) => j !== i)); }
  function setVariant(i, k, v) { setVariants(prev => prev.map((item, j) => j === i ? { ...item, [k]: v } : item)); }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file) {
    if (!file) return null;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('productId', id);
    const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd });
    const d = await res.json();
    setUploading(false);
    if (d.url) { setImageUrl(d.url); setImagePreview(d.url); return d.url; }
    setError(d.error || 'Image upload failed');
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    if (form.salePrice && Number(form.salePrice) >= Number(form.price)) { setError('Sale price must be lower than the regular price'); return; }
    setSaving(true); setError('');

    let finalImageUrl = imageUrl;
    if (imageFile) {
      finalImageUrl = await uploadImage(imageFile) || imageUrl;
    }

    const res = await adminFetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, category: form.category, price: parseInt(form.price),
        sale_price: form.salePrice ? parseInt(form.salePrice) : null,
        description: form.description, material: form.material,
        svg_key: form.svgKey, stock: parseInt(form.stock) || 50,
        image_url: finalImageUrl,
        variants: variants.filter(v => v.label)
      })
    });
    if (res.ok) { router.push('/admin/products'); }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); setSaving(false); }
  }

  if (loading) return <div style={{ color: 'var(--fg-muted)' }}>Loading product...</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push('/admin/products')} style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: '.85rem' }}>← Products</button>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontStyle: 'italic' }}>Edit Product</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Image Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Product Image</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 100, height: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: 'var(--fg-muted)', fontSize: '.75rem' }}>No image</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'inline-block', padding: '9px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '.82rem', color: 'var(--fg)', marginBottom: 8 }}>
                  {uploading ? 'Uploading...' : '📷 Choose Photo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
                </label>
                <div style={{ fontSize: '.75rem', color: 'var(--fg-muted)' }}>JPG, PNG or WebP · Max 5MB</div>
                {imageUrl && !imageFile && <div style={{ fontSize: '.72rem', color: 'var(--success)', marginTop: 4 }}>✓ Image saved</div>}
                {imageFile && <div style={{ fontSize: '.72rem', color: 'var(--accent)', marginTop: 4 }}>New image selected — will upload on save</div>}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required style={fieldStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={fieldStyle}>
                <option value="necklace">Necklace</option>
                <option value="earring">Earring</option>
                <option value="bracelet">Bracelet</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Regular Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} min="1" required style={fieldStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Sale Price (₹, optional)</label>
              <input type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} min="1" placeholder="Leave blank for no discount" style={fieldStyle} />
            </div>
          </div>

          <div>
              <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Stock</label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} min="0" style={fieldStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Material</label>
            <input value={form.material} onChange={e => set('material', e.target.value)} style={fieldStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Fallback Illustration (used if no image)</label>
            <select value={form.svgKey} onChange={e => set('svgKey', e.target.value)} style={fieldStyle}>
              {SVG_KEYS.map(k => <option key={k} value={k}>{k} ({k[0] === 'n' ? 'Necklace' : k[0] === 'e' ? 'Earring' : 'Bracelet'} #{k.slice(1)})</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: '.75rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10, fontWeight: 500 }}>Variants</div>
            {variants.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input value={v.label} onChange={e => setVariant(i, 'label', e.target.value)} placeholder="Label"
                  style={{ flex: 2, padding: '7px 11px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--fg)', fontSize: '.88rem', outline: 'none' }} />
                <input value={v.value} onChange={e => setVariant(i, 'value', e.target.value)} placeholder="Value"
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
            <button type="submit" disabled={saving || uploading}
              style={{ flex: 1, padding: 12, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontFamily: 'var(--font-b)', fontWeight: 500, cursor: 'pointer', fontSize: '.88rem' }}>
              {saving ? 'Saving...' : 'Save Changes'}
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
