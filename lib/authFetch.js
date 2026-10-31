'use client';
import { createClient } from '@/lib/supabase/client';

export async function authFetch(url, options = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(url, { ...options, credentials: 'same-origin', headers });
}
