'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { ChevronsUpDown, Keyboard, Languages, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { logoutUser } from '@/actions/auth-actions';
import { UserAvatar } from '@/components/patterns/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Kbd } from '@/components/ui/kbd';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import type { ShellUser } from './workspace-context';

export function useLogout() {
  const router = useRouter();
  const { t } = useLanguage();
  return async () => {
    try {
      const res = await logoutUser();
      if (res.success) {
        toast.success(t('nav.loggedOutSuccess'));
        router.push('/login');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error(t('ui.logoutFailed'));
    }
  };
}

interface AccountMenuProps {
  user: ShellUser | null;
  /** Icon-only trigger for the collapsed rail */
  compact?: boolean;
  onOpenShortcuts: () => void;
}

export function AccountMenu({ user, compact, onOpenShortcuts }: AccountMenuProps) {
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const logout = useLogout();
  const person = user ?? { id: 'guest', name: t('nav.guestUser'), email: t('nav.notLoggedIn') };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-secondary',
          compact && 'justify-center'
        )}
        aria-label={t('ui.profile')}
      >
        <UserAvatar user={person} size="md" />
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium leading-tight text-foreground">{person.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{person.email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={compact ? 'right' : 'top'} align={compact ? 'end' : 'start'} className="w-64">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-xs text-muted-foreground">{t('ui.signedInAs')}</span>
          <span className="block truncate text-sm font-medium text-foreground">{person.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
            {t('nav.toggleTheme')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages />
            {t('nav.toggleLanguage')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={lang} onValueChange={(v) => setLang(v as 'en' | 'id')}>
              <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="id">Bahasa Indonesia</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={onOpenShortcuts}>
          <Keyboard />
          {t('ui.keyboardShortcuts')}
          <Kbd className="ml-auto">?</Kbd>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={logout}>
          <LogOut />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
