'use client';

import { useState } from 'react';
import { PlanCard } from './PlanCard';
import { createSubscriptionRequest } from '@/app/actions/subscription';
import { toast } from 'react-hot-toast';

interface PricingPlan {
    price: number;
    features: string[];
}

interface Subscription {
    id: string;
    plan: string;
    status: string;
}

export function SubscriptionManager({
    subscription,
    plans
}: {
    subscription: Subscription | null;
    plans: Record<string, PricingPlan>;
}) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleUpgrade = async (plan: string, price: number) => {
        setLoading(plan);
        try {
            await createSubscriptionRequest(plan, price);
            toast.success('Subscription request sent!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send request');
        } finally {
            setLoading(null);
        }
    };

    const sortedPlans = ['basic', 'pro', 'enterprise'];

    // If subscription is pending, we block new requests
    const hasPending = subscription?.status === 'pending';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedPlans.map(planKey => {
                const planDetails = plans[planKey];
                if (!planDetails) return null;

                const isCurrent = subscription?.plan === planKey && subscription.status === 'active';
                const isPending = subscription?.plan === planKey && subscription.status === 'pending';
                const isRejected = subscription?.plan === planKey && subscription.status === 'rejected';

                // Determine if button should be disabled for other plans
                // If we have a pending request (globally), we disable "Select Plan" on others
                const isDisabled = !isCurrent && !isRejected && hasPending && !isPending;

                return (
                    <div key={planKey} className={isDisabled ? "opacity-50 pointer-events-none" : ""}>
                        <PlanCard
                            name={planKey.charAt(0).toUpperCase() + planKey.slice(1)}
                            price={`৳${planDetails.price}`}
                            features={planDetails.features}
                            current={isCurrent}
                            pending={isPending}
                            rejected={isRejected}
                            loading={loading === planKey}
                            onUpgrade={() => handleUpgrade(planKey, planDetails.price)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
