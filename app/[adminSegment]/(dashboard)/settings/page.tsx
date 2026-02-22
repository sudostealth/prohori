'use client';

import { Settings, Save, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            System Configuration
          </h1>
          <p className="text-text-muted mt-2">Manage global platform settings and API integrations.</p>
        </div>
      </div>

      <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-[#222]">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">General Preferences</CardTitle>
          <CardDescription className="text-text-muted">Platform wide defaults and branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-text-muted">Platform Name</Label>
              <Input defaultValue="Prohori (প্রহরী)" className="bg-[#1A1A1A] border-[#333] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-text-muted">Support Email</Label>
              <Input defaultValue="support@prohori.com.bd" className="bg-[#1A1A1A] border-[#333] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-text-muted">Data Retention Period (Days)</Label>
              <Input type="number" defaultValue="90" className="bg-[#1A1A1A] border-[#333] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-text-muted">Tax Rate (VAT %)</Label>
              <Input type="number" defaultValue="5" className="bg-[#1A1A1A] border-[#333] text-white" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-[#1A1A1A] border-t border-[#333] px-6 py-4">
          <Button className="bg-primary hover:bg-primary/90 text-background ml-auto">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="glass-card border-none bg-[#111111]/80 ring-1 ring-red-500/20 border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-xl font-display text-red-500 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-text-muted">Critical system operations requiring owner authorization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#333] rounded-lg">
             <div>
               <h4 className="font-medium text-white">Platform Maintenance Mode</h4>
               <p className="text-sm text-text-muted">Restricts access to all non-admin users across the network.</p>
             </div>
             <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">Enable</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
