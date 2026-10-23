export default function Loading() {
  return (
    <div className="container-x py-12" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-xl bg-black/5" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-black/5" />)}
      </div>
    </div>
  );
}
