'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      // Stable label: the resolved theme is unknown during SSR
      aria-label={t('nav.toggleTheme')}
      title={t('nav.toggleTheme')}
    >
      <Sun className="size-[18px] rotate-0 scale-100 transition-transform duration-base ease-out-expo dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[18px] rotate-90 scale-0 transition-transform duration-base ease-out-expo dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
