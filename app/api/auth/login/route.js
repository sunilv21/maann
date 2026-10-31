import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, phone')
    .eq('id', data.user.id)
    .single();

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || data.user.user_metadata?.name || '',
      phone: profile?.phone || data.user.user_metadata?.phone || '',
      isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
    }
  });
}
