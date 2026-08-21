export default function LoadingProperties() {
  return (
    <div className="container py-16">
      <div className="mb-10">
        <div className="h-3 w-24 bg-line/50 animate-pulse" />
        <div className="mt-3 h-9 w-64 bg-line/50 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <div className="h-96 border border-line bg-surface animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-line/40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
