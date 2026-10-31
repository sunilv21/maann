import { supabaseAdmin } from '@/lib/supabase/admin';
import { getProductPrice } from '@/lib/productPricing';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'featured';

  let query = supabaseAdmin
    .from('products')
    .select('*, product_variants(*), reviews(rating)');

  if (category && category !== 'all') query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);

  switch (sort) {
    case 'price_asc':
    case 'price_desc': break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    default: query = query.order('id', { ascending: true });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const products = (data || []).map(p => ({
    ...p,
    salePrice: p.sale_price ?? null,
    svgKey: p.svg_key,
    imageUrl: p.image_url || null,
    avgRating: p.reviews?.length ? (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1) : 0,
    reviewCount: p.reviews?.length || 0,
    reviews: undefined
  }));

  if (sort === 'price_asc' || sort === 'price_desc') {
    products.sort((a, b) => {
      const difference = getProductPrice(a) - getProductPrice(b);
      return sort === 'price_asc' ? difference : -difference;
    });
  }

  return NextResponse.json({ products });
}
