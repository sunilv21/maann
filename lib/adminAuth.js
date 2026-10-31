import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAdmin(req) {
  let user = null;

  const authHeader = req?.headers?.get('authorization');
  const bearerMatch = authHeader?.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch) {
    const { data, error } = await supabaseAdmin.auth.getUser(bearerMatch[1]);
    if (!error) user = data?.user || null;
  }

  // Fall back to the server-side cookie session when no valid bearer token is present.
  if (!user) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data?.user || null;
    } catch (error) {
      console.error('Unable to read the admin session cookie:', error);
    }
  }

  if (!user) {
    return {
      error: NextResponse.json(
        { error: bearerMatch ? 'Invalid or expired session token' : 'No signed-in session found' },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (error) {
    return { error: NextResponse.json({ error: error.message }, { status: 500 }) };
  }

  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

  return { user };
}
