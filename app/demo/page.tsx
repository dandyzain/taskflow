'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, User, Loader2, ArrowRight } from 'lucide-react';
import { loginUser } from '@/actions/auth-actions';
import { LogoMark } from '@/components/brand/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const DEMO_ACCOUNTS = [
  {
    name: 'Demo User',
    email: 'demo@taskflow.dev',
    role: 'ADMIN',
    desc: 'Workspace Owner • Full access to boards, settings & team members',
    color: 'bg-pastel-lavender text-pastel-lavender-text',
    badgeColor: 'bg-pastel-lavender/50 text-pastel-lavender-text border-purple-300/40',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah@taskflow.dev',
    role: 'MEMBER',
    desc: 'Core Member • Manage tasks, drag cards & collaborate with team',
    color: 'bg-pastel-mint text-pastel-mint-text',
    badgeColor: 'bg-pastel-mint/50 text-pastel-mint-text border-emerald-300/40',
  },
  {
    name: 'Alex Kim',
    email: 'alex@taskflow.dev',
    role: 'MEMBER',
    desc: 'Core Member • Track assigned roadmaps, priorities & deadlines',
    color: 'bg-pastel-sky text-pastel-sky-text',
    badgeColor: 'bg-pastel-sky/50 text-pastel-sky-text border-sky-300/40',
  },
];

export default function DemoLoginPage() {
  const router = useRouter();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleDemoLogin = async (demoEmail: string, name: string) => {
    if (loadingEmail) return;
    setLoadingEmail(demoEmail);

    try {
      const result = await loginUser({ email: demoEmail, password: 'password123' });
      if (result.success) {
        toast.success(`Welcome, logging in as ${name}...`);
        router.push(`/workspace/${result.data.workspaceId}/board/${result.data.boardId}`);
        router.refresh();
      } else {
        toast.error(result.error);
        setLoadingEmail(null);
      }
    } catch {
      toast.error('An unexpected error occurred while logging in.');
      setLoadingEmail(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pastel-mesh-bg p-4 relative overflow-hidden">
      {/* Decorative floating pastel blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-pastel-lavender/40 blur-3xl -z-10 animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pastel-sky/35 blur-3xl -z-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-lg space-y-6 relative z-10 animate-fade-in-up">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1 transition-transform hover:scale-105 active:scale-95 duration-200 drop-shadow-[0_6px_16px_rgba(124,58,237,0.22)]">
            <LogoMark className="w-14 h-14" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Task<span className="bg-gradient-to-r from-[#A78BFA] via-[#7C9CF8] to-[#5CCFC0] bg-clip-text text-transparent">Flow</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary">
            <Sparkles className="w-3 h-3 text-primary" />
            Interactive Demo Portal
          </div>
        </div>

        <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-pastel">
          <CardHeader className="space-y-1 pb-3 text-center sm:text-left">
            <CardTitle className="text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <User className="w-5 h-5 text-primary" />
              1-Click Demo Login
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Select any role profile below to instantly explore TaskFlow with preloaded boards, tasks, and analytics. No password entry required!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isLoadingThis = loadingEmail === acc.email;
              const isAnyLoading = loadingEmail !== null;

              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isAnyLoading}
                  onClick={() => handleDemoLogin(acc.email, acc.name)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-secondary/70 hover:border-primary/40 hover:shadow-xs transition-all duration-200 text-left group active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition-transform group-hover:scale-105 ${acc.color}`}>
                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        acc.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {acc.name}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${acc.badgeColor}`}>
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-1">
                        {acc.desc}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2.5 text-center text-xs border-t border-border/50 pt-4">
            <div className="text-muted-foreground">
              Already have your own account?{' '}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1 ml-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Sign In
              </Link>
            </div>
            <div className="text-muted-foreground/80 text-[11px]">
              Want a fresh workspace?{' '}
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline ml-1"
              >
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Website Footer Copyright Notice & Creator Credit */}
        <footer className="text-center text-xs text-muted-foreground/60 pt-3 pb-2 space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/85">
            Designed & Engineered by <span className="font-semibold text-foreground/95">Dandy Rahmat Zain</span>
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
