import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlanCard({
    name,
    price,
    features,
    current = false,
    pending = false,
    rejected = false,
    loading = false,
    onUpgrade
}: {
    name: string,
    price: string,
    features: string[],
    current?: boolean,
    pending?: boolean,
    rejected?: boolean,
    loading?: boolean,
    onUpgrade?: () => void
}) {
  return (
    <Card className={cn("glass-card relative overflow-hidden flex flex-col h-full",
        current ? "border-primary shadow-[0_0_20px_rgba(0,212,160,0.1)]" : "",
        rejected ? "border-red-500" : ""
    )}>
      {current && (
          <div className="absolute top-0 right-0 bg-primary text-background text-xs font-bold px-3 py-1 rounded-bl-lg">
              CURRENT PLAN
          </div>
      )}
      {pending && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
              PENDING APPROVAL
          </div>
      )}
      {rejected && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              REJECTED
          </div>
      )}

      <CardHeader>
        <CardTitle className="text-xl font-bold font-display text-white">{name}</CardTitle>
        <div className="flex items-baseline mt-2">
            <span className="text-3xl font-bold text-white">{price}</span>
            <span className="text-text-muted ml-1">/month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
         {features.map((feature, i) => (
             <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                 <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                 <span>{feature}</span>
             </div>
         ))}
      </CardContent>
      <CardFooter>
          {current ? (
              <Button disabled className="w-full bg-surface-2 text-text-muted border border-border">Active Plan</Button>
          ) : pending ? (
              <Button disabled className="w-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50">Request Pending</Button>
          ) : rejected ? (
              <Button onClick={onUpgrade} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold" disabled={loading}>
                 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Try Again'}
              </Button>
          ) : (
              <Button onClick={onUpgrade} className="w-full bg-primary hover:bg-primary/90 text-background font-bold" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Select Plan'}
              </Button>
          )}
      </CardFooter>
    </Card>
  );
}
