export default function LoadingDashboard() {
  return (
    <div className="container py-12">
      <div className="h-10 border-b border-line mb-10 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 border border-line bg-surface animate-pulse" />
        ))}
      </div>
      <div className="h-96 border border-line bg-surface animate-pulse" />
    </div>
  );
}
