import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { status } = await req.json();
  const { data } = await supabaseAdmin.from('return_requests').update({ status }).eq('id', params.id).select().single();
  return NextResponse.json(data);
}
