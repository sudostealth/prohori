"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Package, Tag, Loader2, X, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface PlansClientProps {
  plans: Record<string, unknown>[];
  coupons: Record<string, unknown>[];
}

const EMPTY_PLAN = { name: "", price: "", billing_cycle: "monthly", features: "", limits_servers: "5", limits_users: "10", limits_ai: "100", is_published: false };
const EMPTY_COUPON = { code: "", discount_type: "percentage", value: "", max_uses: "", expires_at: "", is_active: true };

export default function PlansClient({ plans: initPlans, coupons: initCoupons }: PlansClientProps) {
  const supabase = createClient();
  const [plans, setPlans] = useState(initPlans);
  const [coupons, setCoupons] = useState(initCoupons);
  const [tab, setTab] = useState<"plans" | "coupons">("plans");

  const [planModal, setPlanModal] = useState<{open: boolean; editing: Record<string,unknown> | null}>({ open: false, editing: null });
  const [planForm, setPlanForm] = useState(EMPTY_PLAN);
  const [saving, setSaving] = useState(false);

  const [couponModal, setCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON);

  const openPlanModal = (plan?: Record<string, unknown>) => {
    if (plan) {
      const limits = plan.limits as Record<string, unknown> || {};
      const features = Array.isArray(plan.features) ? (plan.features as string[]).join("\n") : "";
      setPlanForm({
        name: plan.name as string || "",
        price: String(plan.price || ""),
        billing_cycle: plan.billing_cycle as string || "monthly",
        features,
        limits_servers: String(limits.max_servers || "5"),
        limits_users: String(limits.max_users || "10"),
        limits_ai: String(limits.ai_queries || "100"),
        is_published: plan.is_published as boolean || false,
      });
      setPlanModal({ open: true, editing: plan });
    } else {
      setPlanForm(EMPTY_PLAN);
      setPlanModal({ open: true, editing: null });
    }
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: planForm.name,
        price: parseFloat(planForm.price) || 0,
        billing_cycle: planForm.billing_cycle,
        features: planForm.features.split("\n").filter(Boolean),
        limits: { max_servers: parseInt(planForm.limits_servers), max_users: parseInt(planForm.limits_users), ai_queries: parseInt(planForm.limits_ai) },
        is_published: planForm.is_published,
      };
      if (planModal.editing) {
        const { error } = await supabase.from("subscription_plans").update(payload).eq("id", planModal.editing.id as string);
        if (error) throw error;
        setPlans((p) => p.map((pl) => pl.id === planModal.editing?.id ? { ...pl, ...payload } : pl));
        toast.success("Plan updated!");
      } else {
        const { data, error } = await supabase.from("subscription_plans").insert(payload).select().single();
        if (error) throw error;
        setPlans((p) => [...p, data as Record<string, unknown>]);
        toast.success("Plan created!");
      }
      setPlanModal({ open: false, editing: null });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setPlans((p) => p.filter((pl) => pl.id !== id));
    toast.success("Plan deleted");
  };

  const togglePublish = async (plan: Record<string, unknown>) => {
    const newVal = !plan.is_published;
    const { error } = await supabase.from("subscription_plans").update({ is_published: newVal }).eq("id", plan.id as string);
    if (error) { toast.error(error.message); return; }
    setPlans((p) => p.map((pl) => pl.id === plan.id ? { ...pl, is_published: newVal } : pl));
    toast.success(newVal ? "Plan published!" : "Plan unpublished");
  };

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: couponForm.code.toUpperCase(),
        discount_type: couponForm.discount_type,
        value: parseFloat(couponForm.value) || 0,
        max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
        expires_at: couponForm.expires_at || null,
        is_active: couponForm.is_active,
      };
      const { data, error } = await supabase.from("coupon_codes").insert(payload).select().single();
      if (error) throw error;
      setCoupons((c) => [data as Record<string, unknown>, ...c]);
      setCouponModal(false);
      setCouponForm(EMPTY_COUPON);
      toast.success("Coupon created!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (coupon: Record<string, unknown>) => {
    const newVal = !coupon.is_active;
    await supabase.from("coupon_codes").update({ is_active: newVal }).eq("id", coupon.id as string);
    setCoupons((c) => c.map((cp) => cp.id === coupon.id ? { ...cp, is_active: newVal } : cp));
    toast.success(newVal ? "Coupon activated" : "Coupon deactivated");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans & Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Manage subscription plans and discount codes</p>
        </div>
        <button onClick={() => tab === "plans" ? openPlanModal() : setCouponModal(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /><span>{tab === "plans" ? "New Plan" : "New Coupon"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/3 rounded-xl w-fit">
        {[{ id: "plans", label: "Subscription Plans", icon: Package }, { id: "coupons", label: "Coupon Codes", icon: Tag }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as "plans" | "coupons")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-gray-500 hover:text-gray-300"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Plans */}
      {tab === "plans" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.id as string} className="glass-card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white">{plan.name as string}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePublish(plan)} title={plan.is_published ? "Unpublish" : "Publish"}>
                    {plan.is_published ? <Eye className="w-4 h-4 text-green-400 hover:text-green-300" /> : <EyeOff className="w-4 h-4 text-gray-600 hover:text-gray-400" />}
                  </button>
                  <button onClick={() => openPlanModal(plan)}><Edit2 className="w-4 h-4 text-gray-500 hover:text-cyan-400" /></button>
                  <button onClick={() => deletePlan(plan.id as string)}><Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold gradient-text-cyan">৳{Number(plan.price).toLocaleString()}</span>
                <span className="badge badge-cyan text-xs">{plan.billing_cycle as string}</span>
                {Boolean(plan.is_published) && <span className="badge badge-green text-xs">Live</span>}
              </div>
              <ul className="space-y-1.5 flex-1">
                {((plan.features as string[]) || []).slice(0, 4).map((f, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-3 glass-card p-16 text-center text-gray-600">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No plans created yet. Click &quot;New Plan&quot; to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Coupons */}
      {tab === "coupons" && (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Discount</th><th>Uses</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id as string}>
                  <td className="font-mono font-bold text-cyan-400">{c.code as string}</td>
                  <td className="text-white font-medium">{c.discount_type === "percentage" ? `${c.value}%` : `৳${c.value}`}</td>
                  <td className="text-gray-400 text-xs">{c.uses_count as number}/{c.max_uses as number || "∞"}</td>
                  <td className="text-gray-500 text-xs">{c.expires_at ? new Date(c.expires_at as string).toLocaleDateString() : "Never"}</td>
                  <td><span className={`badge ${c.is_active ? "badge-green" : "badge-gray"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                  <td>
                    <button onClick={() => toggleCoupon(c)} className="text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                      {c.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={6} className="text-center text-gray-600 py-12">No coupon codes yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Plan Modal */}
      {planModal.open && (
        <div className="modal-overlay" onClick={() => setPlanModal({ open: false, editing: null })}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">{planModal.editing ? "Edit Plan" : "Create Plan"}</h3>
              <button onClick={() => setPlanModal({ open: false, editing: null })}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={savePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Plan Name</label>
                  <input className="input-field py-2 text-sm" placeholder="e.g. Professional" value={planForm.name} onChange={(e) => setPlanForm({...planForm, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Price (৳)</label>
                  <input type="number" className="input-field py-2 text-sm" placeholder="7500" value={planForm.price} onChange={(e) => setPlanForm({...planForm, price: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Billing Cycle</label>
                <select className="input-field py-2 text-sm" value={planForm.billing_cycle} onChange={(e) => setPlanForm({...planForm, billing_cycle: e.target.value})}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Features (one per line)</label>
                <textarea className="input-field resize-none h-28 text-sm" placeholder={"5 monitored servers\nAI analyst (100 queries)\nCompliance reports"} value={planForm.features} onChange={(e) => setPlanForm({...planForm, features: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Max Servers</label>
                  <input type="number" className="input-field py-2 text-sm" value={planForm.limits_servers} onChange={(e) => setPlanForm({...planForm, limits_servers: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Max Users</label>
                  <input type="number" className="input-field py-2 text-sm" value={planForm.limits_users} onChange={(e) => setPlanForm({...planForm, limits_users: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">AI Queries</label>
                  <input type="number" className="input-field py-2 text-sm" value={planForm.limits_ai} onChange={(e) => setPlanForm({...planForm, limits_ai: e.target.value})} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={planForm.is_published} onChange={(e) => setPlanForm({...planForm, is_published: e.target.checked})} className="accent-cyan-500" />
                <span className="text-sm text-gray-300">Publish this plan (visible on landing page &amp; billing)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPlanModal({ open: false, editing: null })} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? "Saving..." : planModal.editing ? "Update Plan" : "Create Plan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {couponModal && (
        <div className="modal-overlay" onClick={() => setCouponModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white">Create Coupon Code</h3>
              <button onClick={() => setCouponModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={saveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Coupon Code</label>
                <input className="input-field font-mono uppercase text-sm" placeholder="PROHORI50" value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Discount Type</label>
                  <select className="input-field py-2 text-sm" value={couponForm.discount_type} onChange={(e) => setCouponForm({...couponForm, discount_type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Value</label>
                  <input type="number" className="input-field py-2 text-sm" placeholder={couponForm.discount_type === "percentage" ? "20" : "500"} value={couponForm.value} onChange={(e) => setCouponForm({...couponForm, value: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Max Uses (blank = unlimited)</label>
                  <input type="number" className="input-field py-2 text-sm" placeholder="100" value={couponForm.max_uses} onChange={(e) => setCouponForm({...couponForm, max_uses: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Expiry Date</label>
                  <input type="date" className="input-field py-2 text-sm" value={couponForm.expires_at} onChange={(e) => setCouponForm({...couponForm, expires_at: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCouponModal(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? "Creating..." : "Create Coupon"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
