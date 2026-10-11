'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Sparkles } from 'lucide-react';
import { registerUser } from '@/actions/auth-actions';
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.success) {
        toast.success('Account created successfully! Welcome to TaskFlow.');
        router.push(`/workspace/${result.data.workspaceId}/board/${result.data.boardId}`);
        router.refresh();
      } else {
        toast.error(result.error);
        setLoading(false);
      }
    } catch {
      toast.error('An unexpected error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pastel-mesh-bg p-4 relative overflow-hidden">
      {/* Decorative floating pastel blurs */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-pastel-lavender/40 blur-3xl -z-10 animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-pastel-mint/35 blur-3xl -z-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1 transition-transform hover:scale-105 active:scale-95 duration-200 drop-shadow-[0_6px_16px_rgba(124,58,237,0.22)]">
            <LogoMark className="w-14 h-14" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Join Task<span className="bg-gradient-to-r from-[#A78BFA] via-[#7C9CF8] to-[#5CCFC0] bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Create an account to start managing projects
          </p>
        </div>

        <Card className="rounded-3xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-pastel">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-xs">
              We&apos;ll set up a personal workspace and Kanban board for you automatically
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-9 text-xs border-border/80 focus-visible:ring-primary/40 bg-background/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="rounded-xl h-9 text-xs border-border/80 focus-visible:ring-primary/40 bg-background/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  'Setting up your workspace...'
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register & Setup Workspace
                  </>
                )}
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 text-center text-xs border-t border-border/50 pt-4">
              <div className="text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-1 ml-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Sign in here
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
