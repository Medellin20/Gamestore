'use client';
import { useState } from 'react';

/** const [confirm, dialog] = useConfirm();  if (await confirm({ message })) {...}  puis {dialog} dans le JSX. */
export function useConfirm() {
  const [st, setSt] = useState(null);
  const confirm = (opts) => new Promise((res) => setSt({ ...opts, res }));
  const close = (v) => { st.res(v); setSt(null); };
  const dialog = st && (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm animate-pop rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold">{st.title || 'Confirmer la suppression'}</h3>
        <p className="mt-2 text-sm text-black/60">{st.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => close(false)}>Annuler</button>
          <button className="btn-danger" onClick={() => close(true)}>{st.confirmLabel || 'Supprimer'}</button>
        </div>
      </div>
    </div>
  );
  return [confirm, dialog];
}
