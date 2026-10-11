'use client';

import * as React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
  variant?: 'popover' | 'inline';
}

export function LanguageToggle({ className, variant = 'popover' }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = React.useState(false);

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-1 bg-secondary/60 p-0.5 rounded-xl border border-border/60 text-xs", className)}>
        <button
          onClick={() => setLang('en')}
          className={cn(
            'px-2 py-1 rounded-lg font-bold text-[11px] transition-all',
            lang === 'en'
              ? 'bg-card text-primary shadow-xs border border-border/40'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="English"
        >
          EN
        </button>
        <button
          onClick={() => setLang('id')}
          className={cn(
            'px-2 py-1 rounded-lg font-bold text-[11px] transition-all',
            lang === 'id'
              ? 'bg-card text-primary shadow-xs border border-border/40'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="Bahasa Indonesia"
        >
          ID
        </button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all text-xs font-semibold gap-1.5 shadow-xs border border-border/40 bg-card/40",
            className
          )}
          aria-label="Change language / Ganti bahasa"
          title="Language / Bahasa"
        >
          <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="uppercase font-bold text-[11px] tracking-wide text-foreground">
            {lang}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-48 p-1.5 rounded-2xl border-border/80 shadow-pastel bg-card/95 backdrop-blur-xl"
      >
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Language / Bahasa
          </div>

          {/* English Option */}
          <button
            onClick={() => {
              setLang('en');
              setOpen(false);
            }}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors",
              lang === 'en'
                ? "bg-primary/15 text-primary font-bold"
                : "text-foreground hover:bg-secondary/70"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center text-[10px] font-bold border border-sky-300/40">
                EN
              </span>
              <span>English</span>
            </div>
            {lang === 'en' && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </button>

          {/* Indonesian Option */}
          <button
            onClick={() => {
              setLang('id');
              setOpen(false);
            }}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors",
              lang === 'id'
                ? "bg-primary/15 text-primary font-bold"
                : "text-foreground hover:bg-secondary/70"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold border border-rose-300/40">
                ID
              </span>
              <span>Bahasa Indonesia</span>
            </div>
            {lang === 'id' && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
