'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { loginUser } from '@/actions/auth-actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { t } = useLanguage();

  const fail = (message: string) => {
    toast.error(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      fail(t('ui.fieldsRequired'));
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({ email, password });
      if (result.success) {
        toast.success(t('ui.loginSuccess'));
        router.push(`/workspace/${result.data.workspaceId}/board/${result.data.boardId}`);
        router.refresh();
      } else {
        fail(result.error);
        setLoading(false);
      }
    } catch {
      fail(t('ui.unexpectedError'));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.signIn')}
      description={t('auth.signInDescription')}
      footer={
        <p>
          {t('auth.noAccount')}{' '}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            {t('auth.createAccount')}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', shake && 'animate-shake')} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.emailAddress')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={showPassword ? t('landing.hidePassword') : t('landing.showPassword')}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {loading ? t('auth.signingIn') : t('auth.signInTitle')}
          {!loading && <ArrowRight className="size-4" aria-hidden />}
        </Button>

        <div className="relative py-2 text-center text-xs text-muted-foreground">
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
          <span className="relative bg-background px-3">{t('landing.or')}</span>
        </div>

        <Button asChild variant="outline" size="lg" className="group w-full">
          <Link href="/demo">
            <Sparkles className="size-4 text-primary transition-transform group-hover:rotate-12" aria-hidden />
            {t('auth.previewPrompt')}
          </Link>
        </Button>
      </form>
    </AuthShell>
  );
}
