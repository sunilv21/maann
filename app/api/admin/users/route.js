import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*');

  const combined = (users || []).map(u => {
    const profile = profiles?.find(p => p.id === u.id);
    return { id: u.id, email: u.email, name: profile?.name || '', phone: profile?.phone || '', isAdmin: profile?.is_admin || false, createdAt: u.created_at };
  });

  return NextResponse.json(combined);
}
