import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Client SERVICE ROLE : contourne les RLS. Réservé au code serveur (API routes).
 * Le package `server-only` fait échouer le build si ce fichier est importé côté client.
 */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
