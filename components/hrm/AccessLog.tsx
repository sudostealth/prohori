import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const logs = [
  { id: 1, user: 'Rahim Khan', action: 'Logged In', ip: '192.168.1.1', time: '10:42 AM', status: 'Success' },
  { id: 2, user: 'Fatema Begum', action: 'Viewed Compliance Report', ip: '10.0.0.5', time: '09:15 AM', status: 'Success' },
  { id: 3, user: 'Unknown', action: 'Failed Login (admin)', ip: '45.33.22.11', time: '04:20 AM', status: 'Failed' },
  { id: 4, user: 'Karim Ahmed', action: 'Updated Settings', ip: '192.168.1.50', time: 'Yesterday', status: 'Success' },
];

export function AccessLog() {
  return (
    <div className="rounded-md border border-border bg-surface-2/20">
      <Table>
        <TableHeader className="bg-surface-2/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-text-muted">User</TableHead>
            <TableHead className="text-text-muted">Action</TableHead>
            <TableHead className="text-text-muted">IP Address</TableHead>
            <TableHead className="text-text-muted">Time</TableHead>
            <TableHead className="text-right text-text-muted">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="border-border hover:bg-surface-2/30">
              <TableCell className="font-medium text-white">{log.user}</TableCell>
              <TableCell className="text-text-muted">{log.action}</TableCell>
              <TableCell className="text-text-muted font-mono text-xs">{log.ip}</TableCell>
              <TableCell className="text-text-muted text-sm">{log.time}</TableCell>
              <TableCell className="text-right">
                 <span className={log.status === 'Success' ? 'text-green-500 text-xs' : 'text-red-500 text-xs font-bold'}>
                     {log.status}
                 </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
