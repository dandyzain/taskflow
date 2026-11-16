'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';
import { registerUser } from '@/actions/auth-actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

/** 0–4 rough strength score used only for the visual meter. */
function strength(pw: string) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!name.trim() || !email.trim() || !password) {
      fail(t('ui.fieldsRequired'));
      return;
    }
    if (password.length < 6) {
      fail(t('landing.passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      fail(t('ui.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({ name: name.trim(), email: email.trim(), password });
      if (result.success) {
        toast.success(t('ui.registerSuccess'));
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

  const score = strength(password);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <AuthShell
      title={t('auth.registerTitle')}
      description={t('auth.registerDescription')}
      footer={
        <p>
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {t('auth.signInHere')}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className={cn('space-y-4', shake && 'animate-shake')} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('auth.fullName')}</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder={t('auth.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="h-11"
            required
          />
        </div>
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
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-11"
            aria-describedby="pw-hint"
            required
          />
          <div className="flex gap-1 pt-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full bg-border transition-colors duration-base',
                  score > i && (score <= 1 ? 'bg-danger' : score === 2 ? 'bg-warning' : 'bg-success')
                )}
              />
            ))}
          </div>
          <p id="pw-hint" className="text-xs text-muted-foreground">
            {t('landing.passwordMin')}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            aria-invalid={mismatch || undefined}
            className={cn('h-11', mismatch && 'border-danger focus-visible:border-danger focus-visible:ring-danger/15')}
            required
          />
          {mismatch && (
            <p className="text-xs text-danger" role="alert">
              {t('ui.passwordMismatch')}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
          {!loading && <ArrowRight className="size-4" aria-hidden />}
        </Button>
      </form>
    </AuthShell>
  );
}
