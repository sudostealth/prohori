import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BountyCard } from '@/components/bug-bounty/BountyCard';

const programs = [
  { id: 1, title: 'E-commerce Platform VDP', company: 'ShopUp BD', rewardRange: '৳500 - ৳50,000', description: 'We are looking for vulnerabilities in our main shopping cart and checkout flow. SQLi and XSS are top priorities.' },
  { id: 2, title: 'Fintech API Security', company: 'PayFast', rewardRange: '৳1,000 - ৳100,000', description: 'Test our new v2 API endpoints for authentication bypass and IDOR vulnerabilities.' },
  { id: 3, title: 'Corporate Portal', company: 'MegaGroup', rewardRange: '৳500 - ৳20,000', description: 'Internal employee portal security testing. Focus on access control.' },
];

export default function BugBountyPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Bug Bounty Marketplace</h1>
          <p className="text-text-muted">Crowdsourced security for Bangladeshi SMEs.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-background font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Program
        </Button>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="bg-surface-2 border border-border text-text-muted">
          <TabsTrigger value="discover" className="data-[state=active]:bg-primary data-[state=active]:text-background">Discover Programs</TabsTrigger>
          <TabsTrigger value="my-programs" className="data-[state=active]:bg-primary data-[state=active]:text-background">My Programs</TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-primary data-[state=active]:text-background">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {programs.map(p => (
                   <BountyCard key={p.id} program={p} />
               ))}
           </div>
        </TabsContent>

        <TabsContent value="my-programs" className="mt-6">
           <div className="text-center py-20 bg-surface-2/20 rounded-xl border border-dashed border-border">
               <h3 className="text-lg font-medium text-white">No active programs</h3>
               <p className="text-text-muted mt-2">Create your first bug bounty program to start receiving reports.</p>
               <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/10">Create Program</Button>
           </div>
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
           <div className="text-center py-20 bg-surface-2/20 rounded-xl border border-dashed border-border">
               <h3 className="text-lg font-medium text-white">No submissions yet</h3>
               <p className="text-text-muted mt-2">When researchers submit bugs, they will appear here.</p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
