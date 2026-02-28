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
    const publicRoutes = ['/billing', '/login', '/signup', '/settings'];

    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

    if (isPublicRoute) {
      return;
    }

    if (!subscription) {
      // No subscription found
      router.replace('/billing');
      toast.error('Please select a subscription plan to access full features.');
    } else if (subscription.status === 'pending') {
      // Subscription pending approval
      router.replace('/billing');
    } else if (subscription.status === 'rejected') {
      // Subscription rejected
      router.replace('/billing');
      toast.error('Your subscription request was rejected. Please try again.');
    } else if (subscription.status !== 'active' && subscription.status !== 'trial') {
       // Other inactive statuses
       router.replace('/billing');
       toast.error('Your subscription is not active.');
    }
  }, [subscription, pathname, router]);

  return null;
}
