const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pvhtohzmttglkuauibhg.supabase.co';
const supabaseKey = 'sb_publishable_0MGgsRERmfIi7uhRM40Kww_OAVB0KY_'; // Actually this is the publishable key, it might be NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseKeyFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0MGgsRERmfIi7uhRM40Kww_OAVB0KY_'; // The env said NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKeyFromEnv);

async function main() {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', 'c42b8159-56ae-4540-a948-45a1b999bb8c')
    .single();

  console.log('Data:', data);
  console.log('Error:', error);
}

main();
