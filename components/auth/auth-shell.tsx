'use client';

import Link from 'next/link';
import { m } from 'motion/react';
import { Logo } from '@/components/brand/logo';
import { BoardPreview } from '@/components/brand/board-preview';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage } from '@/lib/i18n/language-context';
import { EASE_OUT } from '@/lib/motion';

interface AuthShellProps {
  title: string;
  description: string;
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

/**
 * Split-screen auth layout: form on the left, an aurora panel with a live
 * mini board on the right (lg+). Stacks to a single column on phones.
 */
export function AuthShell({ title, description, eyebrow, children, footer, wide }: AuthShellProps) {
  const { t } = useLanguage();

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Form side */}
      <div className="relative flex flex-col px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="TaskFlow">
            <Logo markClassName="size-8" textClassName="text-lg" />
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className={wide ? 'w-full max-w-md' : 'w-full max-w-sm'}
          >
            {eyebrow && <div className="mb-4">{eyebrow}</div>}
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
          </m.div>
        </main>

        <footer className="space-y-0.5 text-center text-xs text-muted-foreground lg:text-left">
          <p>
            {t('auth.creatorCredit')} <span className="font-medium text-foreground">{t('auth.creatorName')}</span>
          </p>
          <p>
            © {new Date().getFullYear()} {t('auth.copyright')}
          </p>
        </footer>
      </div>

      {/* Showcase side */}
      <aside className="relative hidden overflow-hidden border-l bg-surface-sunken lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="aurora" aria-hidden />
        <div className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" aria-hidden />
        <div className="relative w-full max-w-xl px-10">
          <m.div
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 }}
          >
            <BoardPreview />
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.35 }}
            className="mt-10 text-center"
          >
            <p className="text-2xl font-semibold tracking-tight">{t('landing.authAside')}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t('landing.authAsideSub')}</p>
          </m.div>
        </div>
      </aside>
    </div>
  );
}
