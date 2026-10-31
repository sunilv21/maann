'use client';
import { createClient } from '@/lib/supabase/client';

// Client-side fetch wrapper that attaches the Supabase access token.
// Use for any authenticated API calls from client components.
export async function authFetch(url, options = {}) {
  const supabase = createClient();
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  let session = currentSession;

  if (!session) {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) session = data.session;
  }

  if (session?.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + 60) {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) session = data.session;
  }

  const sendRequest = (accessToken) => {
    const headers = new Headers(options.headers);
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    return fetch(url, {
      ...options,
      credentials: 'same-origin',
      headers,
    });
  };

  const response = await sendRequest(session?.access_token);
  if (response.status !== 401) return response;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) return response;

  return sendRequest(data.session.access_token);
}
