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

  // Fetch order items separately to avoid FK join dependency
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

  const ordersWithItems = await Promise.all(orders.map(async (order) => {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    return {
      ...order,
      order_items: itemsByOrder[order.id] || [],
      userEmail: authUser?.user?.email || '',
    };
  }));

  return NextResponse.json(ordersWithItems);
}
