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
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ordersWithEmail = await Promise.all((data || []).map(async (order) => {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    return { ...order, userEmail: authUser?.user?.email || '' };
  }));

  return NextResponse.json(ordersWithEmail);
}
