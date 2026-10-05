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
  const shineId = `tf-shine-${uid}`;
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
        <linearGradient id={bgId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="0.55" stopColor="#7C9CF8" />
          <stop offset="1" stopColor="#5CCFC0" />
        </linearGradient>
        <radialGradient
          id={shineId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(14 8) rotate(50) scale(46 40)"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.38" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${bgId})`} />
      <rect width="64" height="64" rx="18" fill={`url(#${shineId})`} />
      {/* Board header — top bar of the T */}
      <rect x="13" y="14" width="38" height="9" rx="4.5" fill="#FFFFFF" />
      {/* Kanban columns — the center column forms the stem of the T */}
      <rect x="13" y="27" width="10" height="15" rx="5" fill="#FFFFFF" fillOpacity="0.55" />
      <rect x="27" y="27" width="10" height="24" rx="5" fill="#FFFFFF" />
      <rect x="41" y="27" width="10" height="10" rx="5" fill="#FFFFFF" fillOpacity="0.55" />
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
