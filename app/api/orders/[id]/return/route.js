import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const { user, error: authError } = await getServerUser(req);
  if (authError) return authError;

  const body = await req.json();
  if (!['return', 'exchange'].includes(body.type) || typeof body.reason !== 'string' || !body.reason.trim()) {
    return NextResponse.json({ error: 'A valid request type and reason are required.' }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, status, order_items(product_name, qty, variant)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status !== 'delivered') {
    return NextResponse.json({ error: 'Returns and exchanges can only be requested for delivered orders.' }, { status: 400 });
  }

  const { data: existingRequest, error: existingError } = await supabaseAdmin
    .from('return_requests')
    .select('id')
    .eq('order_id', order.id)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (existingRequest) return NextResponse.json({ error: 'A return or exchange request already exists for this order.' }, { status: 409 });

  const reason = body.details?.trim()
    ? `${body.reason.trim()}\n\nDetails: ${body.details.trim()}`
    : body.reason.trim();

  const { data: returnReq, error: insertError } = await supabaseAdmin
    .from('return_requests')
    .insert({
      order_id: params.id,
      user_id: user.id,
      type: body.type,
      reason,
      items: (order.order_items || []).map(item => ({
        productName: item.product_name,
        qty: item.qty,
        variant: item.variant
      }))
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'return_requested' })
    .eq('id', params.id)
    .eq('user_id', user.id);
  if (updateError) {
    await supabaseAdmin.from('return_requests').delete().eq('id', returnReq.id);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(returnReq);
}
