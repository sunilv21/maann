import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Resolves the current user from either Authorization: Bearer <token>
// or the server-side session cookie. Returns { user } or { error: Response }.
export async function getServerUser(req) {
  let user = null;

  // Try Bearer token first (since we're now sending it from client)
  const authHeader = req?.headers?.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data } = await supabaseAdmin.auth.getUser(token);
    user = data?.user || null;
  }

  // Fallback to session cookie
  if (!user) {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {}
  }

  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { user };
}
