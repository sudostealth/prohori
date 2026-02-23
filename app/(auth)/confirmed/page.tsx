'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function EmailConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

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
        <Card className="glass-card border-none bg-surface/80 shadow-2xl backdrop-blur-xl p-10 text-center space-y-6 flex flex-col items-center justify-center h-[400px]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
              <p className="text-text-muted">Thank you for confirming your email.</p>
              <p className="text-sm text-text-muted/60">Redirecting to login...</p>
            </div>
        </Card>
      </motion.div>
    </div>
  );
}
