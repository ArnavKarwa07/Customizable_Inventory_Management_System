"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type AuditEntry = {
  id: number; user_id: number; action: string; resource_type: string;
  resource_id: number | null; details: string | null; created_at: string;
};

const RESOURCE_TYPES = ["product", "order", "warehouse", "inventory", "user", "supplier", "category", "organization"];

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("");

  async function loadAudit(resourceType?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (resourceType) params.set("resource_type", resourceType);
      const res = await apiClient.get<AuditEntry[]>(`/audit?${params}`);
      setEntries(res.data); setError("");
    } catch { setError("Failed to load audit log."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadAudit(filter || undefined); }, [filter]);

  const actionBadge = (action: string) => {
    if (action.startsWith("create")) return "badge-status-completed";
    if (action.startsWith("delete")) return "badge-status-cancelled";
    return "badge-status-pending";
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p className="page-subtitle">Full history of all actions taken in your organization</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-secondary)", whiteSpace: "nowrap" }}>Filter by</label>
          <select className="input" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All resources</option>
            {RESOURCE_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--danger-soft)", border: "1px solid #fecaca", color: "var(--danger)", fontSize: "0.85rem", marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, color: "var(--muted)", fontSize: "0.875rem" }}>Loading…</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th><th>Action</th><th>Resource</th><th>Details</th><th>User</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr><td colSpan={5}><div className="empty-state"><p>No audit entries</p></div></td></tr>
                )}
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontSize: "0.78rem", whiteSpace: "nowrap", color: "var(--muted)" }}>
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${actionBadge(entry.action)}`}>{entry.action}</span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {entry.resource_type}
                      {entry.resource_id != null && <span className="text-muted"> #{entry.resource_id}</span>}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--ink-secondary)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.details ?? <span className="text-muted">—</span>}
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "var(--muted)" }}>User #{entry.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
