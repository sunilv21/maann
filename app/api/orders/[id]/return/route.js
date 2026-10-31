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
    .select('id, status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const { data: orderItemsRaw } = await supabaseAdmin
    .from('order_items').select('product_name, qty, variant').eq('order_id', params.id);
  order.order_items = orderItemsRaw || [];

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

  const insertPayload = {
    order_id: params.id,
    user_id: user.id,
    type: body.type,
    reason,
    status: 'requested',
  };

  // Store items snapshot
  try {
    const items = (order.order_items || []).map(i => ({ productName: i.product_name, qty: i.qty, variant: i.variant }));
    if (items.length) insertPayload.items = items;
  } catch {}

  // Store refund details for COD returns
  if (body.type === 'return' && body.refundMode) {
    insertPayload.refund_mode = body.refundMode;
    if (body.refundMode === 'upi') {
      insertPayload.upi_id = body.upiId || null;
    } else {
      insertPayload.account_name = body.accountName || null;
      insertPayload.bank_name = body.bankName || null;
      insertPayload.account_number = body.accountNo || null;
      insertPayload.ifsc = body.ifsc || null;
    }
  }

  const { data: returnReq, error: insertError } = await supabaseAdmin
    .from('return_requests')
    .insert(insertPayload)
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
