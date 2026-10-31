import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('product_id', params.productId)
    .order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req, { params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rating, text } = await req.json();
  if (!rating || !text || text.length < 10)
    return NextResponse.json({ error: 'Rating and review text (min 10 chars) required' }, { status: 400 });

  const { data: profile } = await supabaseAdmin.from('profiles').select('name').eq('id', user.id).single();
  const userName = profile?.name || user.email.split('@')[0];

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({ product_id: parseInt(params.productId), user_id: user.id, user_name: userName, rating, text })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Already reviewed or an error occurred' }, { status: 400 });
  return NextResponse.json(data);
}
