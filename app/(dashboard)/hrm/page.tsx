import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, Download } from 'lucide-react';
import { EmployeeTable } from '@/components/hrm/EmployeeTable';
import { AccessLog } from '@/components/hrm/AccessLog';

export default function HRMPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">HRM & Access Control</h1>
          <p className="text-text-muted">Manage team access and view audit logs.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="border-border text-text-muted hover:text-white hover:bg-surface-2">
                <Download className="mr-2 h-4 w-4" />
                Export Logs
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-background font-bold">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
            </Button>
        </div>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="bg-surface-2 border border-border text-text-muted">
          <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-background">Team Members</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-background">Access Logs</TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-primary data-[state=active]:text-background">Role Management</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-6">
           <EmployeeTable />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
           <AccessLog />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
           <div className="text-center py-20 bg-surface-2/20 rounded-xl border border-dashed border-border">
               <h3 className="text-lg font-medium text-white">Role Management</h3>
               <p className="text-text-muted mt-2">Custom role creation available in Enterprise plan.</p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
