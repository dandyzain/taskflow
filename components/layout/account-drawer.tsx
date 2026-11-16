'use client';

import { useTheme } from 'next-themes';
import { Keyboard, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { useLogout } from '@/components/layout/account-menu';
import type { ShellUser } from '@/components/layout/workspace-context';
import { UserAvatar } from '@/components/patterns/user-avatar';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLanguage } from '@/lib/i18n/language-context';

interface AccountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ShellUser | null;
  onOpenShortcuts: () => void;
}

/** Mobile account sheet: profile, theme, language, shortcuts, sign out. */
export function AccountDrawer({ open, onOpenChange, user, onOpenShortcuts }: AccountDrawerProps) {
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const logout = useLogout();
  const person = user ?? { id: 'guest', name: t('nav.guestUser'), email: t('nav.notLoggedIn') };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center gap-3 text-left">
          <UserAvatar user={person} size="lg" />
          <div className="min-w-0">
            <DrawerTitle className="truncate">{person.name}</DrawerTitle>
            <DrawerDescription className="truncate">{person.email}</DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="space-y-5 px-4 pb-6 pt-2">
          <section className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">{t('nav.toggleTheme')}</h3>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(v) => v && setTheme(v)}
              className="grid w-full grid-cols-3"
            >
              <ToggleGroupItem value="light" className="h-10">
                <Sun /> {t('ui.themeLight')}
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" className="h-10">
                <Moon /> {t('ui.themeDark')}
              </ToggleGroupItem>
              <ToggleGroupItem value="system" className="h-10">
                <Monitor /> {t('ui.themeSystem')}
              </ToggleGroupItem>
            </ToggleGroup>
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">{t('nav.toggleLanguage')}</h3>
            <ToggleGroup
              type="single"
              value={lang}
              onValueChange={(v) => v && setLang(v as 'en' | 'id')}
              className="grid w-full grid-cols-2"
            >
              <ToggleGroupItem value="en" className="h-10">English</ToggleGroupItem>
              <ToggleGroupItem value="id" className="h-10">Bahasa Indonesia</ToggleGroupItem>
            </ToggleGroup>
          </section>
          <div className="divide-y overflow-hidden rounded-xl border">
            <button
              type="button"
              className="flex h-12 w-full items-center gap-3 px-4 text-sm font-medium hover:bg-secondary"
              onClick={() => {
                onOpenChange(false);
                onOpenShortcuts();
              }}
            >
              <Keyboard className="size-4 text-muted-foreground" aria-hidden />
              {t('ui.keyboardShortcuts')}
            </button>
            <button
              type="button"
              className="flex h-12 w-full items-center gap-3 px-4 text-sm font-medium text-danger hover:bg-danger-soft"
              onClick={logout}
            >
              <LogOut className="size-4" aria-hidden />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
