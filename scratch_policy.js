const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://pvhtohzmttglkuauibhg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aHRvaHptdHRnbGt1YXVpYmhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYwNDQzMywiZXhwIjoyMDkyMTgwNDMzfQ.aIh_5jAqB9fj4Rj59yVztSlpk3fLdky3oj2xXsE2ATo'; // from .env.local

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.rpc('get_policies');
  console.log('RPC get_policies Data:', data);
  console.log('RPC get_policies Error:', error);

  // If rpc doesn't work, maybe just fetch using raw query if possible, 
  // but supabase-js cannot run raw SQL directly unless we use an RPC.
  // Let's at least check if we can fetch the package using service_role key
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', 'c42b8159-56ae-4540-a948-45a1b999bb8c')
    .single();

  console.log('Package Data (Service Role):', pkg);
  console.log('Package Error (Service Role):', pkgError);
}

main();
