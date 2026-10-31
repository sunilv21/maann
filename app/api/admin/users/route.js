import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  // Fetch all users with pagination (Supabase default page is 1000)
  let allUsers = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    allUsers = allUsers.concat(data?.users || []);
    if (!data?.users?.length || data.users.length < 1000) break;
    page++;
  }

  const { data: profiles, error: profilesError } = await fetchAllRows(
    supabaseAdmin.from('profiles').select('*')
  );
  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });

  const profilesById = new Map((profiles || []).map(profile => [profile.id, profile]));
  const combined = allUsers.map(u => {
    const profile = profilesById.get(u.id);
    return {
      id: u.id,
      email: u.email,
      name: profile?.name || '',
      phone: profile?.phone || '',
      isAdmin: profile?.is_admin || false,
      createdAt: u.created_at,
      lastLogin: u.last_sign_in_at || null,
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json(combined);
}
