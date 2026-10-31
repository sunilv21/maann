import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { data, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*), return_requests(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 404 });
  return NextResponse.json(data);
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
