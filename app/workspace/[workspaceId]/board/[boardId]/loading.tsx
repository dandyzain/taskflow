export default function BoardLoading() {
  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
      </div>
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[280px] min-w-[280px] bg-muted/50 rounded-xl p-3">
            <div className="h-5 w-24 bg-muted animate-pulse rounded mb-3" />
            {Array.from({ length: 3 - i }).map((_, j) => (
              <div key={j} className="h-20 bg-background animate-pulse rounded-lg mb-2" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
