import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = [
  'requested', 'pickup_scheduled', 'picked_up',
  // return path
  'refund_initiated', 'refunded',
  // exchange path
  'exchange_dispatched', 'exchange_delivered',
];

export async function PATCH(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data: returnReq, error } = await supabaseAdmin
    .from('return_requests')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync order status when exchange milestones are reached
  if (returnReq?.order_id) {
    if (status === 'exchange_dispatched') {
      await supabaseAdmin.from('orders').update({ status: 'out_for_delivery' }).eq('id', returnReq.order_id);
    } else if (status === 'exchange_delivered') {
      await supabaseAdmin.from('orders').update({ status: 'delivered' }).eq('id', returnReq.order_id);
    } else if (status === 'refunded') {
      await supabaseAdmin.from('orders').update({ status: 'returned' }).eq('id', returnReq.order_id);
    }
  }

  return NextResponse.json(returnReq);
}
