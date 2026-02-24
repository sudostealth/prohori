'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Subscription {
  status: string;
}

export function SubscriptionCheck({ subscription }: { subscription: Subscription | null }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Define public routes within the dashboard layout that don't require active subscription
    const publicRoutes = ['/billing', '/login', '/signup'];

    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

    if (isPublicRoute) {
      return;
    }

    if (!subscription) {
      // No subscription found
      router.push('/billing');
      toast.error('Please select a subscription plan to continue.');
    } else if (subscription.status === 'pending') {
      // Subscription pending approval
      // Redirect to billing page to show status
      router.push('/billing');
    } else if (subscription.status === 'rejected') {
      // Subscription rejected
      router.push('/billing');
      toast.error('Your subscription request was rejected. Please try again.');
    } else if (subscription.status !== 'active' && subscription.status !== 'trial') {
       // Other inactive statuses
       router.push('/billing');
       toast.error('Your subscription is not active.');
    } else {
        // Active or Trial - check for connected agent
        // We will handle agent check separately or here if needed.
        // For now, let's just handle subscription.
        // User said: "after getting the subcription the first things is for the user(organization owner) is to connects their website"
        // So we might want to redirect to /connect-server if no agents.
        // But we need agent data for that.
    }
  }, [subscription, pathname, router]);

  return null;
}
