"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Bell, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface ContentClientProps {
  content: Record<string, unknown>[];
}

const EMPTY_FORM = { title: "", body: "", type: "notification", target: "dashboard", is_published: false, priority: 0 };

export default function ContentClient({ content: initContent }: ContentClientProps) {
  const supabase = createClient();
  const [items, setItems] = useState(initContent);
  const [modal, setModal] = useState<{ open: boolean; editing: Record<string, unknown> | null }>({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openModal = (item?: Record<string, unknown>) => {
    if (item) {
      setForm({ title: item.title as string, body: (item.body as string) || "", type: item.type as string, target: item.target as string, is_published: item.is_published as boolean, priority: item.priority as number || 0 });
      setModal({ open: true, editing: item });
    } else {
      setForm(EMPTY_FORM);
      setModal({ open: true, editing: null });
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.editing) {
        const { error } = await supabase.from("platform_content").update(form).eq("id", modal.editing.id as string);
        if (error) throw error;
        setItems((p) => p.map((i) => i.id === modal.editing?.id ? { ...i, ...form } : i));
        toast.success("Content updated!");
      } else {
        const { data, error } = await supabase.from("platform_content").insert(form).select().single();
        if (error) throw error;
        setItems((p) => [data as Record<string, unknown>, ...p]);
        toast.success("Content created!");
      }
      setModal({ open: false, editing: null });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    await supabase.from("platform_content").delete().eq("id", id);
    setItems((p) => p.filter((i) => i.id !== id));
    toast.success("Deleted");
  };

  const toggle = async (item: Record<string, unknown>) => {
    const newVal = !item.is_published;
    await supabase.from("platform_content").update({ is_published: newVal }).eq("id", item.id as string);
    setItems((p) => p.map((i) => i.id === item.id ? { ...i, is_published: newVal } : i));
    toast.success(newVal ? "Published!" : "Unpublished");
  };

  const typeBadge = (type: string) => {
    const m: Record<string, string> = { notification: "badge-cyan", popup: "badge-purple", alert: "badge-red", banner: "badge-orange" };
    return <span className={`badge ${m[type] || "badge-gray"}`}>{type}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Content Management</h1><p className="text-gray-500 text-sm mt-1">Publish notifications, alerts, and banners</p></div>
        <button onClick={() => openModal()} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><Plus className="w-4 h-4" /><span>New Content</span></button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Type</th><th>Target</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id as string}>
                <td>
                  <p className="text-white text-sm font-medium">{item.title as string}</p>
                  {String(item.body || "") && <p className="text-gray-600 text-xs truncate max-w-xs mt-0.5">{String(item.body || "")}</p>}
                </td>
                <td>{typeBadge(item.type as string)}</td>
                <td><span className="badge badge-gray text-xs">{item.target as string}</span></td>
                <td className="text-gray-400 text-sm">{item.priority as number}</td>
                <td><span className={`badge ${item.is_published ? "badge-green" : "badge-gray"}`}>{item.is_published ? "Live" : "Draft"}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(item)} title={item.is_published ? "Unpublish" : "Publish"}>
                      {item.is_published ? <EyeOff className="w-3.5 h-3.5 text-gray-500 hover:text-orange-400" /> : <Eye className="w-3.5 h-3.5 text-gray-500 hover:text-green-400" />}
                    </button>
                    <button onClick={() => openModal(item)}><Edit2 className="w-3.5 h-3.5 text-gray-500 hover:text-cyan-400" /></button>
                    <button onClick={() => deleteItem(item.id as string)}><Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="text-center text-gray-600 py-12"><Bell className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No content items yet</p></td></tr>}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false, editing: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">{modal.editing ? "Edit Content" : "Create Content"}</h3>
              <button onClick={() => setModal({ open: false, editing: null })}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Title</label><input className="input-field text-sm" placeholder="e.g. Scheduled Maintenance" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1">Message Body</label><textarea className="input-field resize-none h-20 text-sm" placeholder="Details of the notification..." value={form.body} onChange={(e) => setForm({...form, body: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                  <select className="input-field py-2 text-sm" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                    <option value="notification">Notification</option>
                    <option value="popup">Popup</option>
                    <option value="alert">Alert</option>
                    <option value="banner">Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Target</label>
                  <select className="input-field py-2 text-sm" value={form.target} onChange={(e) => setForm({...form, target: e.target.value})}>
                    <option value="dashboard">Dashboard</option>
                    <option value="landing">Landing Page</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Priority (higher = shown first)</label>
                <input type="number" className="input-field py-2 text-sm" value={form.priority} onChange={(e) => setForm({...form, priority: parseInt(e.target.value) || 0})} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({...form, is_published: e.target.checked})} className="accent-cyan-500" />
                <span className="text-sm text-gray-300">Publish immediately</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal({ open: false, editing: null })} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? "Saving..." : modal.editing ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
