import { cn } from '@/lib/utils';

/** Brand colour of the mark. Flat on purpose: one colour, one stroke weight. */
export const BRAND_MARK_COLOR = '#5B4AE8';

interface LogoMarkProps {
  className?: string;
  /** Accessible label. Pass an empty string when the mark is decorative. */
  title?: string;
}

/**
 * TaskFlow logo mark — "Clean Board": three equal-width Kanban columns of
 * decreasing height on a flat brand squircle. Keep in sync with app/icon.svg.
 */
export function LogoMark({ className, title = 'TaskFlow' }: LogoMarkProps) {
  const decorative = title === '';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-8 shrink-0', className)}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    >
      <rect width="64" height="64" rx="16" fill={BRAND_MARK_COLOR} />
      <rect x="17" y="18" width="7" height="28" rx="3.5" fill="#FFFFFF" />
      <rect x="28.5" y="18" width="7" height="20" rx="3.5" fill="#FFFFFF" />
      <rect x="40" y="18" width="7" height="12" rx="3.5" fill="#FFFFFF" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

/** Full lockup: logo mark + "TaskFlow" wordmark ("Flow" in the brand colour). */
export function Logo({ className, markClassName, textClassName }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} title="" />
      <span className={cn('font-semibold tracking-tight text-foreground', textClassName)}>
        Task<span className="text-primary">Flow</span>
      </span>
    </span>
  );
}
