export default function LoadingPropertyDetail() {
  return (
    <div className="container py-12">
      <div className="flex gap-3 mb-6">
        <div className="h-6 w-16 bg-line/50 animate-pulse" />
        <div className="h-6 w-20 bg-line/50 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] border border-line bg-surface animate-pulse" />
          <div className="mt-8 h-10 w-2/3 bg-line/50 animate-pulse" />
          <div className="mt-3 h-5 w-1/2 bg-line/40 animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-64 border border-line bg-surface animate-pulse" />
          <div className="h-48 border border-line bg-surface animate-pulse" />
        </div>
      </div>
    </div>
  );
}
