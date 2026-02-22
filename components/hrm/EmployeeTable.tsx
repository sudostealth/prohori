import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const employees = [
  { id: 1, name: 'Rahim Khan', email: 'rahim@company.com', role: 'Owner', status: 'Active', mfa: true, lastActive: 'Now' },
  { id: 2, name: 'Fatema Begum', email: 'fatema@company.com', role: 'Admin', status: 'Active', mfa: true, lastActive: '2h ago' },
  { id: 3, name: 'Karim Ahmed', email: 'karim@company.com', role: 'Viewer', status: 'Inactive', mfa: false, lastActive: '5d ago' },
];

export function EmployeeTable() {
  return (
    <div className="rounded-md border border-border bg-surface-2/20">
      <Table>
        <TableHeader className="bg-surface-2/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-text-muted">Name</TableHead>
            <TableHead className="text-text-muted">Role</TableHead>
            <TableHead className="text-text-muted">Status</TableHead>
            <TableHead className="text-text-muted">MFA</TableHead>
            <TableHead className="text-text-muted">Last Active</TableHead>
            <TableHead className="text-right text-text-muted">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="border-border hover:bg-surface-2/30">
              <TableCell className="font-medium text-white">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/20 text-primary border border-primary/50">
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-text-muted">{employee.email}</div>
                    </div>
                </div>
              </TableCell>
              <TableCell className="text-text-muted">{employee.role}</TableCell>
              <TableCell>
                 <Badge variant="outline" className={employee.status === 'Active' ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-gray-500 border-gray-500/20'}>
                     {employee.status}
                 </Badge>
              </TableCell>
              <TableCell>
                  {employee.mfa ? (
                      <span className="text-xs text-green-500 font-medium">Enabled</span>
                  ) : (
                      <span className="text-xs text-yellow-500 font-medium">Disabled</span>
                  )}
              </TableCell>
              <TableCell className="text-text-muted text-sm">{employee.lastActive}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
