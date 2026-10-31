import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, phone, is_admin')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || '',
      phone: profile?.phone || user.user_metadata?.phone || '',
      isAdmin: profile?.is_admin || false,
    }
  });
}
