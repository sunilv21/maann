import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', params.id).single();
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', params.id);
  const { data: returns } = await supabaseAdmin.from('return_requests').select('*').eq('order_id', params.id);
  return NextResponse.json({ ...order, order_items: items || [], return_requests: returns || [] });
}

export async function PATCH(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { status } = await req.json();
  const validStatuses = ['confirmed','packed','shipped','out_for_delivery','delivered','cancelled','return_requested'];
  if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('orders').update({ status }).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
