import { cn } from '@/lib/utils';

/** Shimmering placeholder. Respects reduced motion via the global CSS rule. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-lg bg-muted bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.05),transparent)] bg-[length:200%_100%] animate-shimmer',
        className
      )}
      {...props}
    />
  );
}
