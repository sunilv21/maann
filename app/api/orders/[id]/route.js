import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', params.id);
  const { data: returns } = await supabaseAdmin.from('return_requests').select('*').eq('order_id', params.id);

  return NextResponse.json({ ...order, order_items: items || [], return_requests: returns || [] });
}

export async function PATCH(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const body = await req.json();
  if (body.status !== 'cancelled') {
    return NextResponse.json({ error: 'Customers can only cancel orders.' }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status !== 'confirmed') {
    return NextResponse.json({ error: 'Only confirmed orders can be cancelled.' }, { status: 400 });
  }

  const { data, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .select()
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json(data);
}
