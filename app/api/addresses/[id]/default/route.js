import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;
  await supabaseAdmin.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  await supabaseAdmin.from('addresses').update({ is_default: true }).eq('id', params.id).eq('user_id', user.id);
  return NextResponse.json({ ok: true });
}
