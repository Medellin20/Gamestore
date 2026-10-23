'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_SETTINGS } from '@/services/settings';

export default function AdminSettings() {
  const sb = supabaseBrowser();
  const toast = useToast();
  const [s, setS] = useState(null);
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.from('store_settings').select('value').eq('key', 'general').maybeSingle()
      .then(({ data }) => setS({ ...DEFAULT_SETTINGS, ...(data?.value || {}) }));
  }, [sb]);

  async function save(e) {
    e.preventDefault(); setBusy(true);
    const { error } = await sb.from('store_settings').upsert({ key: 'general', value: s });
    setBusy(false);
    error ? toast.error(error.message) : toast.success('Paramètres enregistrés');
  }
  async function changePassword(e) {
    e.preventDefault();
    if (pw.length < 8) return toast.error('8 caractères minimum');
    const { error } = await sb.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    setPw(''); toast.success('Mot de passe modifié');
  }
  if (!s) return <div className="h-64 animate-pulse rounded-3xl bg-black/5" />;
  const f = (k) => ({ className: 'input', value: s[k] || '', onChange: (e) => setS({ ...s, [k]: e.target.value }) });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Paramètres</h1>
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Nom de la boutique</label><input required {...f('store_name')} /></div>
        <div><label className="label">Email de contact</label><input type="email" {...f('contact_email')} /></div>
        <div><label className="label">Téléphone</label><input {...f('contact_phone')} /></div>
        <div className="sm:col-span-2"><label className="label">Bandeau d’annonce (haut du site, vide = masqué)</label><input {...f('announcement')} /></div>
        <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>Enregistrer</button></div>
      </form>
      <form onSubmit={changePassword} className="card flex flex-wrap items-end gap-3 p-6">
        <div className="min-w-48 flex-1"><label className="label">Nouveau mot de passe</label><input className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <button className="btn-dark">Changer</button>
      </form>
    </div>
  );
}
