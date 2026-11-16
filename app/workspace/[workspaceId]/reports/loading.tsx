import { Skeleton } from '@/components/ui/skeleton';

/** Matches the reports layout: header, tabs, 8 KPI tiles, two chart cards. */
export default function ReportsLoading() {
  return (
    <div className="h-full overflow-hidden" aria-busy="true">
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-3 pt-4 sm:px-5 sm:pt-5 lg:px-8 lg:pt-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 max-w-[80vw]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-11 w-full sm:w-96" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border bg-card p-4">
              <div className="flex justify-between">
                <Skeleton className="size-9 rounded-xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
