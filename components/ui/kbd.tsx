import { cn } from '@/lib/utils';

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 select-none items-center justify-center gap-0.5 rounded-md border border-b-2 bg-card px-1.5 font-mono text-2xs font-medium text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
