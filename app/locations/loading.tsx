export default function LoadingLocations() {
  return (
    <div className="container py-16">
      <div className="h-8 w-56 bg-line/50 animate-pulse mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-line/40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
