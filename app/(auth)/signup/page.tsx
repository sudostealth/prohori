'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthMeter, checkPasswordStrength } from '@/components/ui/password-strength-meter';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Track success state
  const [errorMsg, setErrorMsg] = useState('');
  // const router = useRouter(); // Removing unused router
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        setLoading(false);
        return;
      }

      const strength = checkPasswordStrength(password);
      if (!Object.values(strength).every(Boolean)) {
        setErrorMsg('Password does not meet all requirements.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            company_name: companyName,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.toLowerCase().includes('already registered')) {
            setErrorMsg('This email is already registered. Please log in.');
        } else {
            setErrorMsg(error.message);
        }
      } else {
        // Instead of toast and redirect, show success animation
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
       {/* Background effect */}
       <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
       </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-none bg-surface/80 shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-6 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-white">Check your email</h2>
                <p className="text-text-muted">
                  We&apos;ve sent a verification link to <span className="font-semibold text-white">{email}</span>.
                  Please check your inbox (and spam folder) to activate your account.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 text-primary">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardHeader className="space-y-1 text-center pb-2">
                  <CardTitle className="text-3xl font-bold font-display text-white">Get Started</CardTitle>
                  <CardDescription className="text-text-muted">
                    Create your Prohori account
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

                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-text">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="Rahim Khan"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="bg-surface-2 border-border text-white focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-text">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="Rahim Store"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="bg-surface-2 border-border text-white focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-text">Work Email</Label>
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
                        <Label htmlFor="password" className="text-text">Password</Label>
                        <PasswordInput
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-surface-2 border-border text-white focus-visible:ring-primary"
                        />
                        <div className="pt-2">
                          <PasswordStrengthMeter password={password} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-text">Confirm Password</Label>
                        <PasswordInput
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-surface-2 border-border text-white focus-visible:ring-primary"
                        />
                      </div>

                      {errorMsg && (
                        <div className="text-red-500 text-sm font-medium pt-2">
                           {errorMsg}
                        </div>
                      )}

                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-background font-bold h-11 mt-4" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </div>

                  <div className="text-center mt-6 text-sm text-text-muted">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                      Log in
                    </Link>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
