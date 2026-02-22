'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartDataPoint {
  time: string;
  critical: number;
  high: number;
  medium: number;
}

interface AlertsChartProps {
  data: ChartDataPoint[];
}

export function AlertsChart({ data }: AlertsChartProps) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--surface-2))" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--text-muted))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--text-muted))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--surface))', 
              borderColor: 'hsl(var(--surface-2))',
              color: 'hsl(var(--text))',
              borderRadius: '0.5rem'
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="critical" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4 }} 
          />
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="#f97316" 
            strokeWidth={2} 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="medium" 
            stroke="#eab308" 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
