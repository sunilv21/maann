import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalUsers },
    { data: revenueData },
    { data: recentOrders },
    { count: pendingReturns }
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('total').neq('status', 'cancelled'),
    supabaseAdmin.from('orders').select('*, order_items(product_name, qty, price)').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('return_requests').select('*', { count: 'exact', head: true }).eq('status', 'requested')
  ]);

  const totalRevenue = revenueData?.reduce((s, o) => s + o.total, 0) || 0;

  return NextResponse.json({ totalOrders, totalProducts, totalUsers, totalRevenue, recentOrders, pendingReturns });
}
