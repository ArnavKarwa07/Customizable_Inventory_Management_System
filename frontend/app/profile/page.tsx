"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type UserProfile = {
  id: number; email: string; full_name: string;
  role_name: string; is_active: boolean; created_at: string;
  org_id: number; org_name: string;
};

const FIELD_LABEL: React.CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  marginBottom: 3,
};

export default function ProfilePage() {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiClient.get<UserProfile>("/users/me");
        setUser(response.data);
      } catch { setError("Unable to load profile."); }
      finally { setLoading(false); }
    }
    void loadProfile();
  }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="page-subtitle">Your account details</p>
        </div>
      </div>

      {loading && <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Loading profile…</div>}
      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--danger-soft)", border: "1px solid #fecaca", color: "var(--danger)", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {user && (
        <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Identity card */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
              <div style={{
                width: 52, height: 52,
                borderRadius: 14,
                background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.3rem",
                fontWeight: 800,
                flexShrink: 0,
              }}>
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 2px", color: "var(--ink)" }}>{user.full_name}</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <p style={FIELD_LABEL}>Role</p>
                <span className={`badge badge-${user.role_name}`}>{user.role_name}</span>
              </div>
              <div>
                <p style={FIELD_LABEL}>Status</p>
                <span className={`badge ${user.is_active ? "badge-status-completed" : "badge-status-cancelled"}`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <p style={FIELD_LABEL}>Organization</p>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0, color: "var(--ink)" }}>{user.org_name}</p>
              </div>
              <div>
                <p style={FIELD_LABEL}>Member since</p>
                <p style={{ fontSize: "0.875rem", margin: 0, color: "var(--ink-secondary)" }}>
                  {new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="card" style={{ padding: "12px 18px" }}>
            <p style={{ ...FIELD_LABEL, marginBottom: 0 }}>Account ID: <span className="mono" style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>#{user.id}</span></p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
