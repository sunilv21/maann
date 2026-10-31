import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;
  const body = await req.json();
  const { data } = await supabaseAdmin
    .from('addresses')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();
  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;
  await supabaseAdmin.from('addresses').delete().eq('id', params.id).eq('user_id', user.id);
  return NextResponse.json({ ok: true });
}
