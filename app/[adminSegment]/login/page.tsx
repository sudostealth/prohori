'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLoginPage() {
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
        toast.error(error.message);
      } else {
        toast.success('Admin login successful');
        // Retrieve the admin segment from env if available, otherwise fallback
        const adminSegment = process.env.NEXT_PUBLIC_ADMIN_URL_SEGMENT || 'admin-secret-portal';
        router.push(`/${adminSegment}`);
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] admin-theme p-4">
      <Card className="w-full max-w-md glass-card border-none bg-surface/90">
        <CardHeader className="space-y-1 text-center items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-white">Master Control</CardTitle>
          <CardDescription className="text-text-muted">
            Authorized personnel only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text">Admin Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@prohori.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="bg-surface-2 border-border text-white focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text">Passphrase</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="bg-surface-2 border-border text-white focus-visible:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-background font-medium mt-6" disabled={loading}>
              {loading ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
