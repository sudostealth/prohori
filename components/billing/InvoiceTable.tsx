import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const invoices = [
  { id: 'INV-2026-001', date: 'Feb 01, 2026', amount: '৳2,499', status: 'Paid', method: 'bKash' },
  { id: 'INV-2026-002', date: 'Jan 01, 2026', amount: '৳2,499', status: 'Paid', method: 'bKash' },
  { id: 'INV-2025-012', date: 'Dec 01, 2025', amount: '৳2,499', status: 'Paid', method: 'Nagad' },
];

export function InvoiceTable() {
  return (
    <div className="rounded-md border border-border bg-surface-2/20">
      <Table>
        <TableHeader className="bg-surface-2/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-text-muted">Invoice ID</TableHead>
            <TableHead className="text-text-muted">Date</TableHead>
            <TableHead className="text-text-muted">Amount</TableHead>
            <TableHead className="text-text-muted">Status</TableHead>
            <TableHead className="text-right text-text-muted">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className="border-border hover:bg-surface-2/30">
              <TableCell className="font-medium text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-text-muted" />
                  {inv.id}
              </TableCell>
              <TableCell className="text-text-muted">{inv.date}</TableCell>
              <TableCell className="text-white font-mono">{inv.amount}</TableCell>
              <TableCell>
                 <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                     {inv.status}
                 </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-text-muted hover:text-white">
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
