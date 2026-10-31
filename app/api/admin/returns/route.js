import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { data: returns, error } = await fetchAllRows(
    supabaseAdmin.from('return_requests').select('*').order('created_at', { ascending: false })
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!returns?.length) return NextResponse.json([]);

  const orderIds = [...new Set(returns.map(r => r.order_id).filter(Boolean))];

  const orders = [];
  const allItems = [];
  for (let i = 0; i < orderIds.length; i += 500) {
    const batch = orderIds.slice(i, i + 500);
    const [{ data: orderBatch, error: ordersError }, { data: itemBatch, error: itemsError }] = await Promise.all([
      fetchAllRows(supabaseAdmin.from('orders').select('*').in('id', batch)),
      fetchAllRows(supabaseAdmin.from('order_items').select('*').in('order_id', batch)),
    ]);
    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 });
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
    orders.push(...orderBatch);
    allItems.push(...itemBatch);
  }

  const ordersById = {};
  (orders || []).forEach(o => { ordersById[o.id] = o; });

  const itemsByOrder = {};
  (allItems || []).forEach(i => {
    if (!itemsByOrder[i.order_id]) itemsByOrder[i.order_id] = [];
    itemsByOrder[i.order_id].push(i);
  });

  // Batch-fetch all user emails in one call
  const emailById = {};
  for (let page = 1; ; page++) {
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
    const users = usersData?.users || [];
    users.forEach(u => { emailById[u.id] = u.email; });
    if (users.length < 1000) break;
  }

  const enriched = returns.map(r => ({
    ...r,
    userEmail: emailById[r.user_id] || '',
    order: ordersById[r.order_id]
      ? { ...ordersById[r.order_id], order_items: itemsByOrder[r.order_id] || [] }
      : null,
  }));

  return NextResponse.json(enriched);
}
