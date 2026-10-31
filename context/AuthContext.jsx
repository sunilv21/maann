'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildUser(supabase, session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        buildUser(supabase, session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function buildUser(supabase, authUser) {
    // Query profiles directly with the browser client (already has the session)
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone, is_admin')
      .eq('id', authUser.id)
      .single();

    setUser({
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.user_metadata?.name || '',
      phone: profile?.phone || authUser.user_metadata?.phone || '',
      isAdmin: profile?.is_admin || false,
    });
    setLoading(false);
  }

  const login = useCallback(async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Invalid email or password' };
    // buildUser will be triggered by onAuthStateChange SIGNED_IN
    return { user: { id: data.user.id, email: data.user.email } };
  }, []);

  const register = useCallback(async (name, email, phone, password, confirmPassword) => {
    if (!name?.trim()) return { error: 'Name is required' };
    if (!email?.includes('@')) return { error: 'Valid email required' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };
    if (password !== confirmPassword) return { error: 'Passwords do not match' };

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });

    if (error) return { error: error.message };

    // If session is returned immediately, onAuthStateChange SIGNED_IN fires → auto logged in
    if (data.session) return {};

    // Email confirmation is required in Supabase settings
    return { needsConfirmation: true };
  }, []);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
