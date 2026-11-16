'use client';

import { Check, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
] as const;

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-9 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground', className)}
          aria-label={t('nav.toggleLanguage')}
        >
          <Languages className="size-4" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide">{lang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => setLang(l.code)} lang={l.code}>
            <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-2xs font-semibold uppercase">
              {l.code}
            </span>
            {l.label}
            {lang === l.code && <Check className="ml-auto text-primary" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
