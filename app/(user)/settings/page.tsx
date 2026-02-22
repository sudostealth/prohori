'use client';

import { Settings, Building2, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-text-muted mt-2">Manage your company profile and communication preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-surface-2 border border-border">
          <TabsTrigger value="profile" className="data-[state=active]:bg-surface data-[state=active]:text-white">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-surface data-[state=active]:text-white">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-surface data-[state=active]:text-white">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card className="glass-card border-none bg-surface/50">
            <CardHeader>
              <CardTitle className="text-xl font-display text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Company Profile
              </CardTitle>
              <CardDescription className="text-text-muted">Update your organization&apos;s details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-text">Company Name</Label>
                  <Input defaultValue="ABC Tech Limited" className="bg-surface-2 border-border text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-text">Business Identification Number (BIN)</Label>
                  <Input defaultValue="987654321098" className="bg-surface-2 border-border text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-text">Contact Email</Label>
                  <Input defaultValue="admin@abctech.com" type="email" className="bg-surface-2 border-border text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-text">Contact Phone</Label>
                  <Input defaultValue="+8801712345678" className="bg-surface-2 border-border text-white" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-text">Address</Label>
                  <Input defaultValue="Road 11, Banani, Dhaka, Bangladesh" className="bg-surface-2 border-border text-white" />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-background" onClick={handleSave}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="glass-card border-none bg-surface/50">
            <CardHeader>
              <CardTitle className="text-xl font-display text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Alert Preferences
              </CardTitle>
              <CardDescription className="text-text-muted">Control how and when you receive security alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label className="text-white font-medium text-base">WhatsApp Critical Alerts</Label>
                  <p className="text-sm text-text-muted">Receive instant WhatsApp messages for critical severity incidents.</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label className="text-white font-medium text-base">Email Summaries</Label>
                  <p className="text-sm text-text-muted">Receive daily summary emails of medium and low severity alerts.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label className="text-white font-medium text-base">New Bug Bounty Submissions</Label>
                  <p className="text-sm text-text-muted">Get notified via email when a researcher submits a new bug.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="bg-primary hover:bg-primary/90 text-background" onClick={handleSave}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
