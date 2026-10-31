// Run once: node scripts/make-admin.js
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const adminEmail = 'radsting16@gmail.com';

  // First ensure is_admin column exists
  console.log('Looking up user:', adminEmail);

  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error('Error listing users:', listErr.message); process.exit(1); }

  const user = users.find(u => u.email === adminEmail);
  if (!user) { console.error('User not found:', adminEmail, '\nMake sure this account is registered first.'); process.exit(1); }

  console.log('Found user:', user.id);

  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to set admin:', error.message);
    console.log('\nIf the column does not exist yet, run this in Supabase SQL Editor first:');
    console.log('alter table public.profiles add column if not exists is_admin boolean default false;');
    process.exit(1);
  }

  console.log('Success! radsting16@gmail.com is now an admin.');
  console.log('Log out and log back in to see the Admin Panel.');
}

main();
