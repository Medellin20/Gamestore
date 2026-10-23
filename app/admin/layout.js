import AdminShell from '@/components/admin/AdminShell';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administration', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await sb.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
    isAdmin = !!data;
  }
  // Le middleware redirige déjà ; ici : double vérification côté serveur.
  if (!isAdmin) return <>{children}</>;
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
