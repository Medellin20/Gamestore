import Link from 'next/link';
export const metadata = { title: 'Page introuvable' };
export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <p className="text-6xl font-semibold tracking-tight text-black/15">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Cette page n’existe pas</h1>
      <Link href="/produits" className="btn-primary mt-8">Voir le catalogue</Link>
    </div>
  );
}
