import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const formData = await req.formData();
  const file = formData.get('file');
  const productId = formData.get('productId');

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
  if (!allowed.includes(ext)) return NextResponse.json({ error: 'Only JPG, PNG, WebP allowed' }, { status: 400 });

  const fileName = `product-${productId}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: uploadError } = await supabaseAdmin.storage
    .from('product-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(fileName);

  if (productId && productId !== 'new') {
    await supabaseAdmin.from('products').update({ image_url: publicUrl }).eq('id', productId);
  }

  return NextResponse.json({ url: publicUrl });
}
