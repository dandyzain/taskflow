'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
  /** Accessible label. Pass an empty string when the mark is decorative. */
  title?: string;
}

/**
 * TaskFlow logo mark — a "T" monogram built from Kanban blocks
 * (board header + three columns) on a pastel lavender → sky → mint squircle.
 *
 * Gradient ids are generated per instance so the mark renders correctly even
 * when another copy lives inside a `display: none` container (e.g. the
 * desktop sidebar on mobile).
 */
export function LogoMark({ className, title = 'TaskFlow' }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `tf-bg-${uid}`;
  const decorative = title === '';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-8 h-8 shrink-0', className)}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      {/* Sleek minimalist squircle */}
      <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
      {/* Minimalist Kanban "T" Monogram — clean, slender, architectural */}
      <rect x="15" y="16" width="34" height="5" rx="2.5" fill="#FFFFFF" />
      <rect x="19" y="24" width="5" height="12" rx="2.5" fill="#FFFFFF" fillOpacity="0.55" />
      <rect x="29.5" y="24" width="5" height="24" rx="2.5" fill="#FFFFFF" />
      <rect x="40" y="24" width="5" height="16" rx="2.5" fill="#FFFFFF" fillOpacity="0.75" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

/** Full lockup: logo mark + "TaskFlow" wordmark ("Flow" in the brand gradient). */
export function Logo({ className, markClassName, textClassName }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} title="" />
      <span className={cn('font-extrabold tracking-tight text-foreground', textClassName)}>
        Task
        <span className="bg-gradient-to-r from-[#A78BFA] via-[#7C9CF8] to-[#5CCFC0] bg-clip-text text-transparent">
          Flow
        </span>
      </span>
    </span>
  );
}
