import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getAuthUserCount() {
  let count = 0;
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return { count: null, error };
    const users = data?.users || [];
    count += users.length;
    if (users.length < 1000) return { count, error: null };
  }
}

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const [
    ordersResult,
    productsResult,
    usersResult,
    revenueResult,
    recentOrdersResult,
    returnsResult,
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    getAuthUserCount(),
    fetchAllRows(supabaseAdmin.from('orders').select('total').neq('status', 'cancelled')),
    supabaseAdmin.from('orders').select('*, order_items(product_name, qty, price)').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('return_requests').select('*', { count: 'exact', head: true }).eq('status', 'requested')
  ]);

  const errors = [ordersResult, productsResult, usersResult, revenueResult, recentOrdersResult, returnsResult]
    .map(result => result.error)
    .filter(Boolean);
  if (errors.length) return NextResponse.json({ error: errors.map(error => error.message).join('; ') }, { status: 500 });

  const totalRevenue = revenueResult.data.reduce((sum, order) => sum + Number(order.total || 0), 0);

  return NextResponse.json({
    totalOrders: ordersResult.count || 0,
    totalProducts: productsResult.count || 0,
    totalUsers: usersResult.count || 0,
    totalRevenue,
    recentOrders: recentOrdersResult.data || [],
    pendingReturns: returnsResult.count || 0,
  });
}
