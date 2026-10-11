'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { loginUser } from '@/actions/auth-actions';
import { LogoMark } from '@/components/brand/logo';
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pastel-mesh-bg p-4 relative overflow-hidden">
      {/* Decorative floating pastel blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-pastel-lavender/40 blur-3xl -z-10 animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pastel-sky/35 blur-3xl -z-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1 transition-transform hover:scale-105 active:scale-95 duration-200 drop-shadow-[0_6px_16px_rgba(124,58,237,0.22)]">
            <LogoMark className="w-14 h-14" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Task<span className="bg-gradient-to-r from-[#A78BFA] via-[#7C9CF8] to-[#5CCFC0] bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Modern Collaborative Task Management
          </p>
        </div>

        <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-pastel">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Welcome back! Please enter your credentials to access your dashboard
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
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 text-center text-xs border-t border-border/50 pt-4">
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

              {/* Link to Dedicated Demo Login */}
              <div className="pt-2 border-t border-border/50 w-full">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200 active:scale-95 group w-full justify-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 transition-transform group-hover:rotate-12" />
                  <span>Looking for a preview? Try Demo Accounts</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Website Footer Copyright Notice */}
        <footer className="text-center text-xs text-muted-foreground/60 pt-2 pb-2">
          <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
          <p className="text-[11px] text-muted-foreground/45 mt-0.5">
            Modern Collaborative Task Management
          </p>
        </footer>
      </div>
    </div>
  );
}
