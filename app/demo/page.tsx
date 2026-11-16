'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { m } from 'motion/react';
import { ArrowRight, Crown, Loader2, Sparkles } from 'lucide-react';
import { loginUser } from '@/actions/auth-actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { UserAvatar } from '@/components/patterns/user-avatar';
import { useLanguage } from '@/lib/i18n/language-context';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

export default function DemoLoginPage() {
  const router = useRouter();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const { t } = useLanguage();

  const demoAccounts = [
    { id: 'demo', name: 'Demo User', email: 'demo@taskflow.dev', role: 'ADMIN', desc: t('auth.demoAdminRole') },
    { id: 'sarah', name: 'Sarah Chen', email: 'sarah@taskflow.dev', role: 'MEMBER', desc: t('auth.demoMember1Role') },
    { id: 'alex', name: 'Alex Kim', email: 'alex@taskflow.dev', role: 'MEMBER', desc: t('auth.demoMember2Role') },
  ];

  const handleDemoLogin = async (demoEmail: string, name: string) => {
    if (loadingEmail) return;
    setLoadingEmail(demoEmail);
    try {
      const result = await loginUser({ email: demoEmail, password: 'password123' });
      if (result.success) {
        toast.success(t('landing.welcomeAs', { name }));
        router.push(`/workspace/${result.data.workspaceId}/board/${result.data.boardId}`);
        router.refresh();
      } else {
        toast.error(result.error);
        setLoadingEmail(null);
      }
    } catch {
      toast.error(t('ui.unexpectedError'));
      setLoadingEmail(null);
    }
  };

  return (
    <AuthShell
      wide
      eyebrow={
        <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-accent px-2.5 text-xs font-medium text-accent-foreground">
          <Sparkles className="size-3.5" aria-hidden />
          {t('landing.demoPortal')}
        </span>
      }
      title={t('auth.demoTitle')}
      description={t('auth.demoDescription')}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {t('auth.backToLogin')}
          </Link>
          <Link href="/register" className="underline-offset-4 hover:text-foreground hover:underline">
            {t('auth.createAccount')}
          </Link>
        </div>
      }
    >
      <ul className="space-y-2.5">
        {demoAccounts.map((acc, i) => {
          const isLoadingThis = loadingEmail === acc.email;
          return (
            <m.li
              key={acc.email}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.1 + i * 0.06 }}
            >
              <button
                type="button"
                disabled={loadingEmail !== null}
                onClick={() => handleDemoLogin(acc.email, acc.name)}
                aria-label={`${t('auth.loginAs')} ${acc.name} (${acc.role})`}
                className={cn(
                  'group flex w-full items-center gap-3.5 rounded-2xl border bg-card p-3.5 text-left shadow-e1 outline-none transition-[box-shadow,border-color,transform] duration-quick',
                  'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-e2 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]',
                  'disabled:pointer-events-none',
                  loadingEmail && !isLoadingThis && 'opacity-50'
                )}
              >
                <UserAvatar user={{ id: acc.id, name: acc.name }} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{acc.name}</span>
                    <span
                      className={cn(
                        'inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-2xs font-medium',
                        acc.role === 'ADMIN' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {acc.role === 'ADMIN' && <Crown className="size-3" aria-hidden />}
                      {acc.role}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{acc.desc}</span>
                  <span className="mt-0.5 block font-mono text-2xs text-muted-foreground">{acc.email}</span>
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {isLoadingThis ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  )}
                </span>
              </button>
            </m.li>
          );
        })}
      </ul>
    </AuthShell>
  );
}
