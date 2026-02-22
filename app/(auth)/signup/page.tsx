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

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        setLoading(false);
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        toast.error('Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.');
        setLoading(false);
        return;
      }

      // Step 1: Sign up the user via Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName, // Used in a trigger or manual insert later
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email to verify.');
        router.push('/login');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-none bg-surface/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold font-display text-white">Create an account</CardTitle>
        <CardDescription className="text-text-muted">
          Enter your details below to get started with Prohori
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="bg-surface-2 border-border text-white focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-text">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              className="bg-surface-2 border-border text-white focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-background font-medium" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
        
        <div className="text-center mt-6 text-sm text-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
