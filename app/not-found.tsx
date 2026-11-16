'use client';

import Link from 'next/link';
import { ArrowLeft, Compass, LayoutGrid } from 'lucide-react';
import { m } from 'motion/react';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/brand/logo';
import { useLanguage } from '@/lib/i18n/language-context';
import { EASE_OUT } from '@/lib/motion';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden p-6">
      <div className="aurora opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_70%)]" aria-hidden />

      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="relative w-full max-w-md text-center"
      >
        <Link href="/" className="mb-10 inline-flex" aria-label="TaskFlow">
          <LogoMark className="size-10" title="" />
        </Link>

        <div className="relative mx-auto mb-6 flex h-32 items-center justify-center">
          <span className="text-gradient-brand select-none font-mono text-[7rem] font-semibold leading-none tracking-tighter opacity-90">
            404
          </span>
          <m.span
            className="absolute right-[18%] top-0 flex size-11 items-center justify-center rounded-2xl border bg-card shadow-e2"
            animate={{ rotate: [0, 12, -8, 0], y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          >
            <Compass className="size-5 text-primary" />
          </m.span>
        </div>

        <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('ui.notFoundEyebrow')}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t('ui.notFoundTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('ui.notFoundDesc')}</p>

        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden />
              {t('ui.backHome')}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/workspace/ws_demo">
              <LayoutGrid className="size-4" aria-hidden />
              {t('ui.openWorkspace')}
            </Link>
          </Button>
        </div>
      </m.div>
    </div>
  );
}
