import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;
  const { data } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const body = await req.json();
  if (body.isDefault) {
    await supabaseAdmin.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  }
  const { data, error: insertError } = await supabaseAdmin
    .from('addresses')
    .insert({
      user_id: user.id,
      name: body.fullName,
      phone: body.phone,
      line1: body.line1,
      line2: body.line2,
      city: body.city,
      state: body.state,
      pin: body.pincode,
      is_default: body.isDefault || false
    })
    .select()
    .single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json(data);
}
