'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { checkIsAdmin } from '@/app/actions/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
      } else {
        // Check if admin
        const isAdmin = await checkIsAdmin(email);

        toast.success('Logged in successfully');

        if (isAdmin) {
          // Redirect to admin subdomain
          window.location.href = 'https://hq.prohori.app';
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
       {/* Background effect */}
       <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
       </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-none bg-surface/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-3xl font-bold font-display text-white">Welcome Back</CardTitle>
            <CardDescription className="text-text-muted">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <GoogleSignInButton />

               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface px-2 text-text-muted">Or continue with</span>
                  </div>
                </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-surface-2 border-border text-white focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-text">Password</Label>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-surface-2 border-border text-white focus-visible:ring-primary"
                  />
                  {/* Password Strength Meter - Requested for Login too */}
                  <div className="pt-2">
                    <PasswordStrengthMeter password={password} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-background font-bold h-11 mt-4" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log in'}
                </Button>
              </form>
            </div>

            <div className="text-center mt-6 text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
