import { createBrowserClient } from '@supabase/ssr';

let client;
/** Client navigateur (clé anon uniquement). Les droits sont imposés par les RLS. */
export function supabaseBrowser() {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return client;
}
