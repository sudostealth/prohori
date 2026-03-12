"use client";
import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface EmailClientProps {
  companies: Record<string, unknown>[];
  emailLogs: Record<string, unknown>[];
}

const TEMPLATES = [
  { id: "welcome", label: "Welcome", subject: "Welcome to Prohori Security Suite", body: "Dear {company},\n\nWelcome to Prohori! Your account is now active.\n\nBest regards,\nProhori Team" },
  { id: "invoice", label: "Invoice", subject: "Your Prohori Subscription Invoice", body: "Dear {company},\n\nPlease find your subscription invoice attached.\n\nBest regards,\nProhori Team" },
  { id: "alert", label: "Security Alert", subject: "🚨 Security Alert — Action Required", body: "Dear {company},\n\nWe have detected an important security event that requires your attention.\n\nPlease log in to your dashboard immediately.\n\nBest regards,\nProhori Security Team" },
  { id: "custom", label: "Custom", subject: "", body: "" },
];

export default function EmailClient({ companies, emailLogs }: EmailClientProps) {
  const supabase = createClient();
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [method, setMethod] = useState("smtp");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"compose" | "logs">("compose");

  const applyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setSelectedTemplate(tmpl.id);
    setSubject(tmpl.subject);
    setBody(tmpl.body);
  };

  const toggleCompany = (id: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedCompanies(companies.map((c) => c.id as string));
  const clearAll = () => setSelectedCompanies([]);

  const sendEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompanies.length === 0) { toast.error("Select at least one company"); return; }
    if (!subject || !body) { toast.error("Subject and body are required"); return; }
    setSending(true);
    try {
      // Log emails to DB
      const logs = selectedCompanies.map((cid) => ({
        to_company_id: cid,
        to_email: companies.find((c) => c.id === cid)?.name as string + "@example.com",
        subject,
        template: selectedTemplate,
        method,
        status: "sent",
      }));
      await supabase.from("email_logs").insert(logs);
      toast.success(`Email queued for ${selectedCompanies.length} company/companies via ${method}`);
      setSelectedCompanies([]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Email Manager</h1><p className="text-gray-500 text-sm mt-1">Send emails to company owners</p></div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-white/3 rounded-xl w-fit">
        {[{ id: "compose", label: "Compose" }, { id: "logs", label: "Sent Logs" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as "compose" | "logs")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-gray-500 hover:text-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "compose" && (
        <form onSubmit={sendEmails}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Compose */}
            <div className="lg:col-span-2 space-y-5">
              {/* Templates */}
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white mb-3">Email Template</h2>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedTemplate === t.id ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "text-gray-500 border-white/5 hover:border-white/15"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject</label>
                  <input className="input-field text-sm" placeholder="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Message Body</label>
                  <textarea className="input-field resize-none h-36 text-sm font-mono" placeholder="Email content..." value={body} onChange={(e) => setBody(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Sending Method</label>
                  <div className="flex gap-2 flex-wrap">
                    {["smtp", "resend", "supabase", "direct"].map((m) => (
                      <label key={m} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs font-medium transition-all ${method === m ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/5 text-gray-500 hover:border-white/10"}`}>
                        <input type="radio" value={m} checked={method === m} onChange={() => setMethod(m)} className="accent-cyan-500 sr-only" />
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={sending} className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{sending ? "Sending..." : `Send to ${selectedCompanies.length} compan${selectedCompanies.length === 1 ? "y" : "ies"}`}</span>
              </button>
            </div>

            {/* Right: Company selector */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Recipients</h2>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="text-xs text-cyan-400 hover:text-cyan-300">All</button>
                  <button type="button" onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
                </div>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {companies.map((c) => (
                  <label key={c.id as string} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${selectedCompanies.includes(c.id as string) ? "bg-cyan-500/10 border border-cyan-500/20" : "hover:bg-white/3 border border-transparent"}`}>
                    <input type="checkbox" checked={selectedCompanies.includes(c.id as string)} onChange={() => toggleCompany(c.id as string)} className="accent-cyan-500" />
                    <div>
                      <p className="text-sm font-medium text-white">{c.name as string}</p>
                    </div>
                    {selectedCompanies.includes(c.id as string) && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 ml-auto" />}
                  </label>
                ))}
                {companies.length === 0 && <p className="text-gray-600 text-sm text-center py-4">No companies yet</p>}
              </div>
            </div>
          </div>
        </form>
      )}

      {tab === "logs" && (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>To</th><th>Subject</th><th>Template</th><th>Method</th><th>Status</th><th>Sent</th></tr></thead>
            <tbody>
              {emailLogs.map((log) => (
                <tr key={log.id as string}>
                  <td className="text-white text-sm">{log.to_email as string}</td>
                  <td className="text-gray-400 text-xs max-w-xs truncate">{log.subject as string}</td>
                  <td className="text-gray-500 text-xs">{(log.template as string) || "Custom"}</td>
                  <td><span className="badge badge-gray text-xs">{log.method as string}</span></td>
                  <td><span className={`badge ${log.status === "sent" ? "badge-green" : "badge-red"}`}>{log.status as string}</span></td>
                  <td className="text-gray-600 text-xs">{new Date(log.sent_at as string).toLocaleString()}</td>
                </tr>
              ))}
              {emailLogs.length === 0 && <tr><td colSpan={6} className="text-center text-gray-600 py-12"><Mail className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No emails sent yet</p></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
