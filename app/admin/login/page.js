'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function AdminLogin() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const sb = supabaseBrowser();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { toast.error('Email ou mot de passe incorrect'); setBusy(false); return; }
    const { data: row } = await sb.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (!row) {
      await sb.auth.signOut();
      toast.error('Ce compte n’a pas accès à l’administration');
      setBusy(false); return;
    }
    router.replace('/admin'); router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <form onSubmit={submit} className="w-full max-w-sm animate-pop space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion admin</h1>
        <div><label className="label">Email</label><input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Mot de passe</label><input className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </div>
  );
}
