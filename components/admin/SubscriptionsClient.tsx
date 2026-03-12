"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionsClientProps {
  requests: Record<string, unknown>[];
}

export default function SubscriptionsClient({ requests }: SubscriptionsClientProps) {
  const [items, setItems] = useState(requests);
  const [rejectModal, setRejectModal] = useState<{ id: string; company: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const approve = async (reqId: string, companyId: string, planId: string) => {
    setLoading(reqId);
    try {
      const res = await fetch("/api/subscription/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId, companyId, planId, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");

      setItems((prev) => prev.map((r) => r.id === reqId ? { ...r, status: "approved" } : r));
      toast.success("Subscription approved!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setLoading(null);
    }
  };

  const reject = async () => {
    if (!rejectModal) return;
    setLoading(rejectModal.id);
    try {
      const res = await fetch("/api/subscription/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId: rejectModal.id, action: "reject", rejectReason: rejectReason || "Request declined by admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject");

      setItems((prev) => prev.map((r) => r.id === rejectModal.id ? { ...r, status: "rejected" } : r));
      setRejectModal(null);
      setRejectReason("");
      toast.success("Request rejected");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Approved</Badge>;
    if (status === "rejected") return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Rejected</Badge>;
    return <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)] animate-pulse">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{items.filter((r) => r.status === "pending").length} pending review</p>
      </div>

      <Card className="bg-navy-900 border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/5">
                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">TrxID</th>
                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((req) => (
                <tr key={req.id as string} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-white font-bold text-sm">{(req.companies as Record<string,unknown>)?.name as string}</td>
                  <td className="p-4 text-cyan-400/90 font-medium text-xs">{(req.subscription_plans as Record<string,unknown>)?.name as string}</td>
                  <td className="p-4 text-gray-500 font-medium text-xs">{new Date(req.requested_at as string).toLocaleDateString()}</td>
                  
                  <td className="p-4">
                    {req.payment_method ? (
                      <Badge variant="outline" className={`font-bold tracking-wider uppercase text-[10px] ${req.payment_method === 'bkash' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : req.payment_method === 'nagad' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {req.payment_method as string}
                      </Badge>
                    ) : (
                       <span className="text-gray-600 font-medium text-xs">N/A</span>
                    )}
                  </td>
                  <td className="p-4 text-white font-mono text-sm tracking-wider uppercase">{req.transaction_id as string || <span className="text-gray-600 text-xs tracking-normal normal-case">—</span>}</td>
                  
                  <td className="p-4">{statusBadge(req.status as string)}</td>
                  <td className="p-4">
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => approve(req.id as string, req.company_id as string, req.plan_id as string)}
                          disabled={loading === req.id}
                          className="h-8 bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-navy-900 border-0 font-bold px-3 transition-colors shadow-none"
                        >
                          {loading === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRejectModal({ id: req.id as string, company: (req.companies as Record<string,unknown>)?.name as string })}
                          disabled={loading === req.id}
                          className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold px-3"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {req.status !== "pending" && (
                      <span className="text-xs text-gray-600 font-medium">
                        Resolved {new Date(req.resolved_at as string).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-16 font-medium">No subscription requests requiring review</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModal(null)}>
          <div className="bg-navy-900 border border-white/10 shadow-2xl rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Reject Request</h3>
                <p className="text-sm font-medium text-gray-400">{rejectModal.company}</p>
              </div>
            </div>
            <div className="mb-6 space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Rejection Reason</label>
              <textarea
                className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 resize-none transition-all"
                placeholder="e.g. Invalid Transaction ID. Please verify your payment with bKash."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setRejectModal(null)} variant="outline" className="flex-1 py-5 bg-transparent border-white/10 hover:bg-white/5 font-bold text-gray-300">Cancel</Button>
              <Button onClick={reject} disabled={loading === rejectModal.id} className="flex-1 py-5 bg-red-500 hover:bg-red-400 text-white font-bold tracking-wide shadow-[0_0_15px_rgba(239,68,68,0.3)] border-0">
                {loading === rejectModal.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
