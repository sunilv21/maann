import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { data } = await supabaseAdmin.from('orders').select('*, order_items(*), return_requests(*)').eq('id', params.id).single();
  return NextResponse.json(data);
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
