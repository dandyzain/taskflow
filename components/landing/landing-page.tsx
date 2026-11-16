'use client';

import Link from 'next/link';
import { m, useScroll, useTransform } from 'motion/react';
import { ArrowRight, BarChart3, Command, MousePointer2, Smartphone, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { BoardPreview } from '@/components/brand/board-preview';
import { Reveal } from '@/components/patterns/reveal';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { useLanguage } from '@/lib/i18n/language-context';
import { EASE_OUT } from '@/lib/motion';

export function LandingPage() {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  // Gentle parallax tilt that flattens as the preview scrolls into view
  const rotateX = useTransform(scrollY, [0, 400], [14, 0]);
  const y = useTransform(scrollY, [0, 400], [0, -30]);
  const navShadow = useTransform(scrollY, [0, 24], ['0 0 0 0 transparent', '0 1px 0 0 hsl(var(--border))']);

  const features = [
    { icon: MousePointer2, title: t('landing.f1Title'), desc: t('landing.f1Desc') },
    { icon: Command, title: t('landing.f2Title'), desc: t('landing.f2Desc') },
    { icon: BarChart3, title: t('landing.f3Title'), desc: t('landing.f3Desc') },
    { icon: Smartphone, title: t('landing.f4Title'), desc: t('landing.f4Desc') },
  ];

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      {/* Nav */}
      <m.header
        style={{ boxShadow: navShadow }}
        className="glass-panel sticky top-0 z-40 pt-[env(safe-area-inset-top)]"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="TaskFlow" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Logo markClassName="size-8" textClassName="text-lg" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <LanguageToggle className="hidden xs:inline-flex" />
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">{t('landing.signIn')}</Link>
            </Button>
            <Button asChild size="sm" className="h-9">
              <Link href="/register">{t('landing.getStarted')}</Link>
            </Button>
          </nav>
        </div>
      </m.header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[40rem] overflow-hidden" aria-hidden>
          <div className="aurora opacity-70" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="inline-flex h-8 items-center gap-2 rounded-full border bg-card/70 px-3 text-xs font-medium text-muted-foreground shadow-e1 backdrop-blur"
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            {t('landing.eyebrow')}
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.06 }}
            className="mx-auto mt-6 max-w-3xl text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl lg:text-7xl"
          >
            {t('landing.titleA')}{' '}
            <span className="text-gradient-brand">{t('landing.titleB')}</span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {t('landing.subtitle')}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.18 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild variant="brand" size="lg" className="group w-full sm:w-auto">
              <Link href="/demo">
                {t('landing.tryDemo')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/register">{t('landing.getStarted')}</Link>
            </Button>
          </m.div>
          <p className="mt-3 text-xs text-muted-foreground">{t('landing.noSignup')}</p>

          {/* Product preview with scroll-linked tilt */}
          <div className="mx-auto mt-14 max-w-4xl [perspective:1400px]">
            <m.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.25 }}
            >
              <m.div style={{ rotateX, y }} className="origin-top">
                <div className="relative">
                  <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-brand opacity-25 blur-3xl" aria-hidden />
                  <BoardPreview className="text-left" />
                </div>
              </m.div>
            </m.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal animateBars={false} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t('landing.featuresEyebrow')}</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('landing.featuresTitle')}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} animateBars={false} delay={i * 0.06}>
              <article className="group relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-e1 transition-[box-shadow,transform] duration-base hover:-translate-y-0.5 hover:shadow-e2">
                <div
                  className="absolute -right-16 -top-16 size-40 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-slow group-hover:opacity-20"
                  aria-hidden
                />
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                {i === 1 && (
                  <div className="mt-4 flex items-center gap-1" aria-hidden>
                    <Kbd className="h-7 min-w-7 text-sm">⌘</Kbd>
                    <Kbd className="h-7 min-w-7 text-sm">K</Kbd>
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <Reveal animateBars={false}>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border bg-card px-6 py-14 text-center shadow-e2 sm:px-12">
            <div className="aurora opacity-50" aria-hidden />
            <div className="relative">
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t('landing.ctaTitle')}</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('landing.ctaSub')}</p>
              <Button asChild variant="brand" size="lg" className="group mt-8">
                <Link href="/demo">
                  {t('landing.tryDemo')}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo markClassName="size-6" textClassName="text-sm" />
          <p className="text-center">
            {t('auth.creatorCredit')} <span className="font-medium text-foreground">{t('auth.creatorName')}</span> · ©{' '}
            {new Date().getFullYear()} {t('auth.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
