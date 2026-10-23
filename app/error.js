'use client';
export default function Error({ error, reset }) {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Une erreur est survenue</h1>
      <p className="mt-2 text-black/55">La page n’a pas pu se charger. {error?.digest && <span className="text-xs">Réf. {error.digest}</span>}</p>
      <button onClick={reset} className="btn-primary mt-8">Réessayer</button>
    </div>
  );
}
