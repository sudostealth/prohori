"use client";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { CreditCard, CheckCircle, Clock, X, Tag, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { SubscriptionPlan } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface BillingClientProps {
  companyId: string;
  plans: SubscriptionPlan[];
  activeSub: Record<string, unknown> | null;
  latestRequest: Record<string, unknown> | null;
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function BillingClient({ companyId, plans, activeSub, latestRequest }: BillingClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponResult, setCouponResult] = useState<null | { valid: boolean; discount: number; type: string }>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad">("bkash");
  const [transactionId, setTransactionId] = useState("");

  const isPending = latestRequest?.status === "pending";
  const isRejected = latestRequest?.status === "rejected";
  const hasActive = !!activeSub;

  const validateCoupon = async () => {
    if (!coupon || !selectedPlan) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, planId: selectedPlan.id }),
      });
      const data = await res.json();
      setCouponResult(data);
      if (data.valid) {
        toast.success(`Coupon applied! ${data.type === "percentage" ? `${data.discount}% off` : `৳${data.discount} off`}`);
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const confirmRequest = async () => {
    if (!selectedPlan) return;
    if (!companyId) {
      toast.error("Company profile not found. Please log out and log back in, or contact support.");
      return;
    }

    setRequesting(true);
    try {
      const discountAmt = couponResult?.valid
        ? couponResult.type === "percentage"
          ? selectedPlan.price * (couponResult.discount / 100)
          : couponResult.discount
        : 0;

      const res = await fetch("/api/subscription/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          plan_id: selectedPlan.id,
          coupon_code: couponResult?.valid ? coupon : null,
          discount_amount: discountAmt,
          payment_method: paymentMethod,
          transaction_id: transactionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      toast.success("Subscription request sent! Awaiting admin approval.");
      setShowConfirm(false);
      setSelectedPlan(null);
      setTransactionId("");
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setRequesting(false);
    }
  };

  const finalPrice = (plan: SubscriptionPlan) => {
    if (!couponResult?.valid || selectedPlan?.id !== plan.id) return plan.price;
    if (couponResult.type === "percentage") return plan.price * (1 - couponResult.discount / 100);
    return Math.max(0, plan.price - couponResult.discount);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Billing & Subscription</h1>
        <p className="text-gray-400 text-sm mt-1.5 font-medium">Choose the plan that fits your business requirements</p>
      </motion.div>

      {/* Status banners */}
      <AnimatePresence>
        {hasActive && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
            <Alert className="bg-green-500/10 border-green-500/20 text-green-400 flex items-center gap-4 py-4 px-5">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex flex-shrink-0 items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400 drop-shadow-[0_0_8px_currentColor]" />
              </div>
              <div>
                <AlertTitle className="text-base font-bold text-green-300 mb-0.5">Active Subscription</AlertTitle>
                <AlertDescription className="text-sm text-green-400/80 font-medium">
                  {(activeSub.subscription_plans as SubscriptionPlan)?.name} —{" "}
                  {activeSub.expires_at ? `Expires ${new Date(activeSub.expires_at as string).toLocaleDateString()}` : "Lifetime"}
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}
        {isPending && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
            <Alert className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 flex items-center gap-4 py-4 px-5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex flex-shrink-0 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/20 animate-pulse" />
                <Clock className="w-6 h-6 text-cyan-400 relative z-10" />
              </div>
              <div>
                <AlertTitle className="text-base font-bold text-cyan-300 mb-0.5">Request Pending</AlertTitle>
                <AlertDescription className="text-sm text-cyan-400/80 font-medium">
                  Your request for <strong>{(latestRequest?.subscription_plans as Record<string,unknown>)?.name as string}</strong> is awaiting admin approval.
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}
        {isRejected && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 py-4 px-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex flex-shrink-0 items-center justify-center mt-1">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertTitle className="text-base font-bold text-red-300 mb-1">Previous Request Rejected</AlertTitle>
                <AlertDescription className="text-sm text-red-400/80 leading-relaxed font-medium">
                  {Boolean(latestRequest?.rejection_reason) ? `Reason: ${String(latestRequest?.rejection_reason || "")}` : "No specific reason provided."}
                  <span className="block text-xs mt-2 text-red-400/60 font-semibold uppercase tracking-wider">You can select a below plan to request again.</span>
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans */}
      {plans.length > 0 ? (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => {
            const isSelected = selectedPlan?.id === plan.id;
            const isCurrent = (activeSub?.plan_id as string) === plan.id;
            
            return (
              <motion.div 
                key={plan.id} 
                variants={fadeUpVariant}
                whileHover={!hasActive && !isSelected ? { y: -8, transition: { duration: 0.2 } } : {}}
                className={`h-full relative transition-all duration-300 ${isSelected ? "lg:-translate-y-4" : ""}`}
              >
                <Card
                  onClick={() => !hasActive && setSelectedPlan(isSelected ? null : plan)}
                  className={`h-full flex flex-col relative cursor-pointer overflow-hidden border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-cyan-500 bg-navy-800 shadow-[0_0_30px_rgba(0,212,255,0.15)]"
                      : isCurrent
                      ? "border-green-500/50 bg-green-500/5 hover:border-green-500"
                      : "border-white/10 bg-navy-900/40 hover:border-white/20 hover:bg-navy-800/60"
                  }`}
                >
                  {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 mix-blend-overlay pointer-events-none" />}
                  {isSelected && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500" />}
                  
                  {i === 1 && !isCurrent && !isSelected && (
                    <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                      <div className="absolute top-6 -right-6 w-32 bg-gradient-to-r from-cyan-500 to-purple-600 rotate-45 text-center text-[10px] font-bold text-white py-1 shadow-lg tracking-widest uppercase">
                        Popular
                      </div>
                    </div>
                  )}

                  <CardContent className="p-8 flex-1 flex flex-col relative z-10">
                    {isCurrent && (
                      <Badge className="absolute top-4 right-4 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30 text-xs font-bold tracking-wider">
                        CURRENT PLAN
                      </Badge>
                    )}

                    <div className="mb-4 pr-12">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <Badge variant="outline" className={`text-xs font-semibold ${isSelected ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10" : "border-white/10 text-gray-400 bg-white/5"}`}>
                        {plan.billing_cycle === "monthly" ? "Monthly" : "Yearly"}
                      </Badge>
                    </div>

                    <div className="mb-6">
                      <span className={`text-4xl font-extrabold ${isSelected ? "text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-purple-400" : "text-white"}`}>
                        {plan.price === 0 ? "Free" : `৳${plan.price.toLocaleString()}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 text-sm ml-1 font-medium">/{plan.billing_cycle === "monthly" ? "mo" : "yr"}</span>
                      )}
                    </div>

                    <div className="w-full h-px bg-white/10 mb-6" />

                    <ul className="space-y-4 flex-1 mb-8">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-gray-300 leading-snug">
                          <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? "text-cyan-400" : "text-green-400/80"}`} />
                          <span className="flex-1 opacity-90">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {isSelected && !hasActive && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-auto space-y-4 border-t border-white/10 pt-6">
                        <div className="flex gap-2 relative">
                          <Input
                            className="text-sm py-5 px-4 bg-black/20 border-white/10 focus-visible:ring-cyan-500 text-white placeholder-gray-500 font-medium"
                            placeholder="Coupon code (optional)"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            onClick={(e) => { e.stopPropagation(); validateCoupon(); }}
                            disabled={validatingCoupon || !coupon}
                            variant="secondary"
                            className="bg-white/10 hover:bg-white/20 text-white h-auto"
                          >
                            {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                          </Button>
                        </div>
                        
                        <AnimatePresence>
                          {couponResult?.valid && (
                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-green-400 font-medium flex items-center gap-1.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <CheckCircle className="w-4 h-4" />
                              Final price: <strong className="text-base text-white ml-auto">৳{finalPrice(plan).toLocaleString()}</strong>
                            </motion.p>
                          )}
                        </AnimatePresence>
                        
                        <Button
                          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                          className="w-full text-base font-bold py-6 bg-cyan-500 hover:bg-cyan-400 text-navy-900 shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] transition-all"
                        >
                          Request This Plan
                        </Button>
                      </motion.div>
                    )}

                    {!isSelected && !hasActive && (
                      <div className={`mt-auto pt-4 text-center text-sm font-bold uppercase tracking-wider ${isSelected ? "text-cyan-400" : "text-gray-500"}`}>
                        {isCurrent ? "Current Plan" : "Select Plan"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="glass-card p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <CreditCard className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-xl font-bold text-white mb-2">No plans available right now</p>
          <p className="text-gray-400 max-w-sm">Please check back later or contact the administrator to see available subscriptions.</p>
        </div>
      )}

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowConfirm(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">Confirm Request</h3>
                  <button onClick={() => setShowConfirm(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="p-5 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] pointer-events-none rounded-full" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Selected Plan</p>
                  <p className="text-2xl font-bold text-white mb-1 relative z-10">{selectedPlan.name}</p>
                  <div className="flex items-baseline gap-1.5 relative z-10">
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      ৳{finalPrice(selectedPlan).toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-medium">/{selectedPlan.billing_cycle === "monthly" ? "mo" : "yr"}</span>
                  </div>
                  {couponResult?.valid && (
                    <div className="mt-3 pt-3 border-t border-white/10 inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md">
                      <Tag className="w-3.5 h-3.5" /> Coupon code &quot;{coupon}&quot; applied
                    </div>
                  )}
                </div>

                {/* Modern Payment Gateway Mock UI */}
                <div className="mb-8">
                  <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">Select Payment Method</p>
                  <div className="flex gap-3 mb-4">
                    <button 
                      onClick={() => setPaymentMethod("bkash")}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === "bkash" ? "border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.2)]" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                    >
                      <span className={`text-sm font-bold tracking-tight ${paymentMethod === "bkash" ? "text-pink-500" : "text-gray-400"}`}>bKash</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("nagad")}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === "nagad" ? "border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                    >
                       <span className={`text-sm font-bold tracking-tight ${paymentMethod === "nagad" ? "text-orange-500" : "text-gray-400"}`}>Nagad</span>
                    </button>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-300 mb-2">Please send exactly <strong className="text-white">৳{finalPrice(selectedPlan).toLocaleString()}</strong> to our merchant number:</p>
                    <div className="flex items-center justify-between bg-navy-900 border border-white/10 rounded-lg p-3">
                       <code className={`text-lg font-bold tracking-wider ${paymentMethod === "bkash" ? "text-pink-400" : "text-orange-400"}`}>01700-000000</code>
                       <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 uppercase text-[10px] tracking-wider font-bold">Merchant</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Transaction ID (TrxID)</label>
                    <Input 
                      placeholder="e.g. 9XZ6AL8P2M" 
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      className="h-12 bg-black/30 border-white/10 text-white placeholder-gray-600 focus-visible:ring-cyan-500 uppercase tracking-widest font-mono text-center text-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button onClick={() => setShowConfirm(false)} variant="outline" className="flex-1 py-6 bg-transparent border-white/10 hover:bg-white/5 text-gray-300 font-bold">
                    Cancel
                  </Button>
                  <Button onClick={confirmRequest} disabled={requesting || !transactionId} className="flex-1 py-6 bg-cyan-500 hover:bg-cyan-400 text-navy-900 font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                    {requesting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {requesting ? "Sending Request..." : "Verify Payment"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
