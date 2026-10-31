import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data: orders, error } = await fetchAllRows(query);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!orders?.length) return NextResponse.json([]);

    const orderIds = orders.map(o => o.id);

    const allItems = [];
    for (let i = 0; i < orderIds.length; i += 500) {
      const { data, error: itemsError } = await fetchAllRows(
        supabaseAdmin.from('order_items').select('*').in('order_id', orderIds.slice(i, i + 500))
      );
      if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
      allItems.push(...data);
    }

    const allUsers = [];
    for (let page = 1; ; page++) {
      const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
      const users = data?.users || [];
      allUsers.push(...users);
      if (users.length < 1000) break;
    }

    const itemsByOrder = {};
    allItems.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });

    const emailById = {};
    allUsers.forEach(u => { emailById[u.id] = u.email; });

    return NextResponse.json(orders.map(order => ({
      ...order,
      order_items: itemsByOrder[order.id] || [],
      userEmail: emailById[order.user_id] || '',
    })));
  } catch (e) {
    console.error('[admin/orders] unhandled error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
