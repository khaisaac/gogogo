const fs = require('fs');

const replaceInFile = (file, replacer) => {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
  }
};

replaceInFile('src/components/Navbar.tsx', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server";/, 'import { getUser } from "@/lib/auth";\nimport { createClient } from "@/lib/supabase/server";')
  .replace(/const supabase = await createClient\(\);\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);/g, 'const user = await getUser();')
);

replaceInFile('src/app/dashboard/page.tsx', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server";/, 'import { getUser } from "@/lib/auth";')
  .replace(/const supabase = await createClient\(\);\s*const \{\s*data: \{ user \},\s*\} = await supabase\.auth\.getUser\(\);/g, 'const user = await getUser();')
);

replaceInFile('src/app/api/user/profile/route.ts', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server"/, 'import { getUser } from "@/lib/auth"')
  .replace(/const supabase = await createClient\(\)\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/g, 'const user = await getUser()')
);

replaceInFile('src/app/api/bookings/route.ts', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server"/, 'import { getUser } from "@/lib/auth"')
  .replace(/const supabase = await createClient\(\)\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/g, 'const user = await getUser()')
);

replaceInFile('src/app/api/bookings/refund/route.ts', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server"/, 'import { getUser } from "@/lib/auth"')
  .replace(/const supabase = await createClient\(\)\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/g, 'const user = await getUser()')
);

replaceInFile('src/app/api/admin/uploads/sign/route.ts', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server"/, 'import { getUser } from "@/lib/auth"')
  .replace(/const supabase = await createClient\(\)\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/g, 'const user = await getUser()')
);

replaceInFile('src/app/api/admin/uploads/route.ts', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server"/, 'import { getUser } from "@/lib/auth"')
  .replace(/const supabase = await createClient\(\)\s*const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/g, 'const user = await getUser()')
);

replaceInFile('src/app/api/auth/signout/route.ts', c => c
  .replace(/import \{ createClient \} from '@\/lib\/supabase\/server'/, "import { clearSessionCookie } from '@/lib/auth'")
  .replace(/const supabase = await createClient\(\)\s*const \{ error \} = await supabase\.auth\.signOut\(\)/g, 'await clearSessionCookie()\nconst error = null')
);

replaceInFile('src/app/admin/_lib.ts', c => c
  .replace(/import \{ createClient \} from "@\/lib\/supabase\/server";/, 'import { getUser } from "@/lib/auth";')
  .replace(/const supabase = await createClient\(\);\s*const \{\s*data: \{ user \},\s*\} = await supabase\.auth\.getUser\(\);/g, 'const user = await getUser();')
);
