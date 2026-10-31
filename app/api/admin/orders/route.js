import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);

  const { data: orders, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!orders?.length) return NextResponse.json([]);

  // Fetch order items separately (no FK join)
  const orderIds = orders.map(o => o.id);
  const { data: allItems } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  const itemsByOrder = {};
  (allItems || []).forEach(item => {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item);
  });

  // Batch-fetch all user emails in one call instead of N calls
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = {};
  (usersData?.users || []).forEach(u => { emailById[u.id] = u.email; });

  const ordersWithItems = orders.map(order => ({
    ...order,
    order_items: itemsByOrder[order.id] || [],
    userEmail: emailById[order.user_id] || '',
  }));

  return NextResponse.json(ordersWithItems);
}
