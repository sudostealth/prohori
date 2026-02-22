import { ComplianceSummaryCard } from '@/components/compliance/ComplianceSummaryCard';
import { ReportGenerator } from '@/components/compliance/ReportGenerator';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Compliance Center</h1>
            <p className="text-text-muted">Manage your regulatory status for Cyber Security Act 2023.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <span>Audit Ready</span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <ComplianceSummaryCard title="CSA 2023 Score" score={92} status="compliant" issues={0} />
           <ComplianceSummaryCard title="Data Privacy" score={85} status="warning" issues={2} />
           <ComplianceSummaryCard title="Infrastructure" score={98} status="compliant" issues={0} />
           <ComplianceSummaryCard title="Policy Coverage" score={45} status="non-compliant" issues={5} />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
               <div className="glass-card p-6">
                  <h3 className="text-lg font-bold font-display text-white mb-4">Compliance Checklist</h3>
                  <div className="space-y-4">
                      {[
                        { label: 'Data Localization (stored in Bangladesh)', status: 'pass' },
                        { label: 'Incident Response Plan Active', status: 'pass' },
                        { label: 'Regular Vulnerability Scanning', status: 'pass' },
                        { label: 'Employee Access Control Logs', status: 'pass' },
                        { label: 'Encryption at Rest', status: 'fail' },
                        { label: 'Two-Factor Authentication Enforced', status: 'pass' },
                      ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded bg-surface-2/30 border border-border">
                              <span className="text-sm text-white">{item.label}</span>
                              {item.status === 'pass' ? (
                                  <span className="flex items-center gap-1 text-xs font-bold text-green-500 uppercase">
                                      <CheckCircle2 className="h-3 w-3" /> Pass
                                  </span>
                              ) : (
                                  <span className="flex items-center gap-1 text-xs font-bold text-red-500 uppercase">
                                      <XCircle className="h-3 w-3" /> Fail
                                  </span>
                              )}
                          </div>
                      ))}
                  </div>
               </div>
           </div>
           <div className="lg:col-span-1 h-full">
               <ReportGenerator />
           </div>
       </div>
    </div>
  );
}
