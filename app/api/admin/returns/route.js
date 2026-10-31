import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { data: returns, error } = await supabaseAdmin
    .from('return_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!returns?.length) return NextResponse.json([]);

  const orderIds = [...new Set(returns.map(r => r.order_id).filter(Boolean))];

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .in('id', orderIds);

  const { data: allItems } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  const ordersById = {};
  (orders || []).forEach(o => { ordersById[o.id] = o; });

  const itemsByOrder = {};
  (allItems || []).forEach(i => {
    if (!itemsByOrder[i.order_id]) itemsByOrder[i.order_id] = [];
    itemsByOrder[i.order_id].push(i);
  });

  // Batch-fetch all user emails in one call
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = {};
  (usersData?.users || []).forEach(u => { emailById[u.id] = u.email; });

  const enriched = returns.map(r => ({
    ...r,
    userEmail: emailById[r.user_id] || '',
    order: ordersById[r.order_id]
      ? { ...ordersById[r.order_id], order_items: itemsByOrder[r.order_id] || [] }
      : null,
  }));

  return NextResponse.json(enriched);
}
