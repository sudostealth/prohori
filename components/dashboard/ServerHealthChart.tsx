'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: '12 AM', cpu: 10, ram: 20 },
  { name: '4 AM', cpu: 15, ram: 22 },
  { name: '8 AM', cpu: 45, ram: 50 },
  { name: '12 PM', cpu: 60, ram: 65 },
  { name: '4 PM', cpu: 55, ram: 58 },
  { name: '8 PM', cpu: 30, ram: 40 },
  { name: '11 PM', cpu: 20, ram: 25 },
];

export function ServerHealthChart() {
  return (
    <Card className="glass-card h-[300px]">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Server Health</CardTitle>
      </CardHeader>
      <CardContent className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4A0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00D4A0" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
              itemStyle={{ color: '#F9FAFB' }}
            />
            <Area type="monotone" dataKey="cpu" stroke="#00D4A0" fillOpacity={1} fill="url(#colorCpu)" />
            <Area type="monotone" dataKey="ram" stroke="#FF6B35" fillOpacity={1} fill="url(#colorRam)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
