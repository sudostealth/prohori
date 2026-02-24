'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Subscription {
  status: string;
}

export function AgentConnectionCheck({
    subscription,
    agentStatus
}: {
    subscription: Subscription | null,
    agentStatus: string | null
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Routes that don't require agent connection
    const exemptRoutes = [
        '/billing',
        '/connect-server',
        '/settings',
        '/support',
        '/login',
        '/signup'
    ];

    const isExempt = exemptRoutes.some(route => pathname?.startsWith(route));

    if (isExempt) return;

    // Only check if subscription is active
    if (subscription && subscription.status === 'active') {
        if (!agentStatus || agentStatus !== 'connected') {
            // No connected agent found
            // Use replace instead of push to avoid history stack issues?
            // But push is fine usually.

            // To prevent multiple toasts on re-renders, check if we are already redirecting?
            // useEffect dependencies handles re-renders mostly.

            router.push('/connect-server');
            // We can toast, but it might be annoying on every page load.
            // Maybe check if we just redirected?
            // For now, let's keep it simple.
            toast('Please connect your server to continue.', { icon: '🔌', id: 'connect-agent-toast' });
        }
    }
  }, [subscription, agentStatus, pathname, router]);

  return null;
}
