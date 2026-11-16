import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors the real board layout (header, toolbar, columns) so nothing jumps on load. */
export default function BoardLoading() {
  const cardsPerColumn = [3, 2, 2, 1];
  return (
    <div className="flex h-full flex-col overflow-hidden px-3 pt-4 sm:px-5 sm:pt-5 lg:px-7 lg:pt-6" aria-busy="true">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-[70vw]" />
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 flex-1 sm:max-w-xs" />
        <Skeleton className="hidden h-9 w-[10.5rem] lg:block" />
        <Skeleton className="hidden h-9 w-[10.5rem] lg:block" />
        <Skeleton className="ml-auto h-9 w-24" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {cardsPerColumn.map((n, i) => (
          <div key={i} className="w-[85vw] max-w-[320px] shrink-0 space-y-2 rounded-2xl border bg-surface-sunken/80 p-3 sm:w-[296px]">
            <div className="flex items-center gap-2 pb-1">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-5 w-7 rounded-full" />
            </div>
            {Array.from({ length: n }).map((_, j) => (
              <div key={j} className="space-y-2.5 rounded-xl border bg-card p-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between pt-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="size-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
