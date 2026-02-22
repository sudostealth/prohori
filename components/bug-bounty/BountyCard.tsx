import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Shield } from 'lucide-react';

interface Program {
  title: string;
  rewardRange: string;
  company: string;
  description: string;
}

export function BountyCard({ program }: { program: Program }) {
  return (
    <Card className="glass-card flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-white">{program.title}</CardTitle>
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                {program.rewardRange}
            </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted mt-2">
            <Building2 className="h-4 w-4" />
            <span>{program.company}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
         <p className="text-sm text-text-muted line-clamp-3 mb-4">{program.description}</p>
         <div className="flex gap-2">
             <Badge variant="secondary" className="text-xs bg-surface-2 text-text-muted">
                <Globe className="h-3 w-3 mr-1" /> Web
             </Badge>
             <Badge variant="secondary" className="text-xs bg-surface-2 text-text-muted">
                <Shield className="h-3 w-3 mr-1" /> Infrastructure
             </Badge>
         </div>
      </CardContent>
      <CardFooter>
         <Button className="w-full bg-surface-2 hover:bg-surface border border-border text-white">View Program</Button>
      </CardFooter>
    </Card>
  );
}
