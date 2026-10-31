'use client';
import { createClient } from '@/lib/supabase/client';

export async function authFetch(url, options = {}) {
  const supabase = createClient();
  const { data: { session: storedSession }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  let session = storedSession;
  if (session?.expires_at && session.expires_at * 1000 <= Date.now() + 60_000) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    session = data.session;
  }

  const sendRequest = activeSession => {
    const headers = new Headers(options.headers);
    if (activeSession?.access_token) {
      headers.set('Authorization', `Bearer ${activeSession.access_token}`);
    }
    return fetch(url, { ...options, cache: 'no-store', credentials: 'same-origin', headers });
  };

  const response = await sendRequest(session);
  if (response.status !== 401 || !session?.refresh_token) return response;

  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  if (!data.session) return response;
  return sendRequest(data.session);
}
