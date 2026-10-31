import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*), reviews(*)')
    .eq('id', params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const avgRating = data.reviews?.length
    ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1)
    : 0;

  return NextResponse.json({
    ...data,
    salePrice: data.sale_price ?? null,
    avgRating,
    reviewCount: data.reviews?.length || 0
  });
}
