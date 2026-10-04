'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogIn, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { loginUser } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    desc: 'Workspace Owner',
    color: 'bg-pastel-lavender text-pastel-lavender-text',
    badgeColor: 'bg-pastel-lavender/50 text-pastel-lavender-text',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah@taskflow.dev',
    role: 'MEMBER',
    desc: 'Core Member',
    color: 'bg-pastel-mint text-pastel-mint-text',
    badgeColor: 'bg-pastel-mint/50 text-pastel-mint-text',
  },
  {
    name: 'Alex Kim',
    email: 'alex@taskflow.dev',
    role: 'MEMBER',
    desc: 'Core Member',
    color: 'bg-pastel-sky text-pastel-sky-text',
    badgeColor: 'bg-pastel-sky/50 text-pastel-sky-text',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({ email, password });
      if (result.success) {
        toast.success('Login successful! Redirecting...');
        router.push(`/workspace/${result.data.workspaceId}/board/${result.data.boardId}`);
        router.refresh();
      } else {
        toast.error(result.error);
        setLoading(false);
      }
    } catch {
      toast.error('An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pastel-mesh-bg p-4 relative overflow-hidden">
      {/* Decorative floating pastel blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-pastel-lavender/40 blur-3xl -z-10 animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pastel-sky/35 blur-3xl -z-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-pastel mb-1 transition-transform hover:scale-105 active:scale-95 duration-200">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">TaskFlow</h1>
          <p className="text-xs text-muted-foreground font-medium">
            Modern Collaborative Task Management
          </p>
        </div>

        <Card className="rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-pastel">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Welcome back! Enter credentials or choose a 1-click demo account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-9 text-xs border-border/80 focus-visible:ring-primary/40 bg-background/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-9 text-xs border-border/80 focus-visible:ring-primary/40 bg-background/60"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 rounded-xl font-semibold shadow-xs hover:shadow-pastel transition-all duration-200 active:scale-[0.98] mt-2" 
                disabled={loading}
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Dashboard
                  </>
                )}
              </Button>

              {/* Quick Login Section */}
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-muted-foreground/90 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    1-Click Demo Accounts
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickLogin(acc.email)}
                      className="flex items-center justify-between text-left p-2.5 rounded-2xl border border-border/60 bg-card/60 hover:bg-secondary/70 hover:border-primary/30 transition-all duration-200 text-xs group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${acc.color}`}>
                          {acc.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-xs">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">{acc.email}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-border/40 shrink-0 ${acc.badgeColor}`}>
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 text-center text-xs border-t border-border/50 pt-4">
              <div className="text-muted-foreground">
                Don&apos;t have an account yet?{' '}
                <Link
                  href="/register"
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-1 ml-1"
                >
                  Create an account
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
