"use client";
import { useState, useEffect } from "react";
import { Download, Trash2, FileSpreadsheet, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CompanyUploadedLog } from "@/types";

export default function LogsSettingsPage() {
  const [logs, setLogs] = useState<CompanyUploadedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log file? This action cannot be undone.")) return;

    setDeleting(logId);
    try {
      const res = await fetch("/api/logs/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });

      if (res.ok) {
        setLogs((prev) => prev.filter((log) => log.id !== logId));
      } else {
        alert("Failed to delete log file.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting log file.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-4" />
        <p className="text-gray-400">Loading your logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <div className="glass-card overflow-hidden mb-8">
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Download className="w-6 h-6 text-purple-400 rotate-180" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Uploaded Logs</h1>
              <p className="text-gray-500 text-sm mt-1">Manage files uploaded for AI offline analysis</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {logs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-black/20">
              <FileSpreadsheet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Logs Uploaded</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">You haven&apos;t uploaded any log files yet. You can upload logs from the dashboard.</p>
              <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{log.file_name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span>{(log.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{log.row_count} rows/lines</span>
                        <span>•</span>
                        <span>Uploaded: {new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                      {log.summary && (
                        <p className="text-xs text-gray-400 mt-2 bg-black/40 px-3 py-1.5 rounded-md inline-block">
                          {log.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Link href={`/dashboard/ai-analyst?logId=${log.id}`} className="btn-secondary flex-1 sm:flex-none justify-center py-2 px-3 text-xs">
                      Analyze Log
                    </Link>
                    <button
                      onClick={() => handleDelete(log.id)}
                      disabled={deleting === log.id}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Delete log"
                    >
                      {deleting === log.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-orange-300">Data Privacy</h3>
          <p className="text-xs text-orange-400/80 mt-1 leading-relaxed">
            Your uploaded logs are stored securely in your isolated company storage bucket.
            When you analyze a log, only relevant excerpts are sent to the AI model.
            Delete logs here when you no longer need them to free up your storage quota.
          </p>
        </div>
      </div>
    </div>
  );
}
