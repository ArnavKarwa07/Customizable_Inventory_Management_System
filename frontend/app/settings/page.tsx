"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { hasScope } from "@/lib/auth-storage";

type User    = { id: number; email: string; full_name: string; role_name: string; is_active: boolean; created_at: string };
type OrgInfo = { id: number; name: string; slug: string };

export default function SettingsPage() {
  const [org, setOrg]         = useState<OrgInfo | null>(null);
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const canManageUsers = hasScope("users:read");
  const canUpdateOrg   = hasScope("org:update");
  const canInvite      = hasScope("users:create");
  const canUpdateUsers = hasScope("users:update");
  const canDeleteUsers = hasScope("users:delete");

  async function loadData() {
    setLoading(true);
    try {
      const [orgRes, usersRes] = await Promise.all([
        apiClient.get<OrgInfo>("/org"),
        canManageUsers ? apiClient.get<User[]>("/users") : Promise.resolve({ data: [] }),
      ]);
      setOrg(orgRes.data); setUsers(usersRes.data); setError("");
    } catch { setError("Failed to load settings."); }
    finally { setLoading(false); }
  }

  async function updateOrgName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const res = await apiClient.patch("/org", { name: String(form.get("org_name")) });
      setOrg(res.data);
      setSuccess("Organization name updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Failed to update organization."); }
  }

  async function inviteUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiClient.post("/auth/invite", {
        email:      String(form.get("email")),
        full_name:  String(form.get("full_name")),
        password:   String(form.get("password")),
        role_name:  String(form.get("role_name")),
      });
      (e.target as HTMLFormElement).reset();
      setSuccess("User invited successfully.");
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err: any) { setError(err?.response?.data?.detail ?? "Failed to invite user."); }
  }

  async function changeRole(userId: number, role_name: string) {
    try { await apiClient.patch(`/users/${userId}`, { role_name }); await loadData(); }
    catch (err: any) { setError(err?.response?.data?.detail ?? "Failed to change role."); }
  }

  async function deactivateUser(userId: number) {
    if (!confirm("Deactivate this user?")) return;
    try { await apiClient.delete(`/users/${userId}`); await loadData(); }
    catch (err: any) { setError(err?.response?.data?.detail ?? "Failed to deactivate user."); }
  }

  useEffect(() => { void loadData(); }, []);

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--muted)",
    marginBottom: 14,
  };

  const alertStyle = (type: "error" | "success"): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 6,
    background: type === "error" ? "var(--danger-soft)" : "var(--success-soft)",
    border: `1px solid ${type === "error" ? "#fecaca" : "#a7f3d0"}`,
    color: type === "error" ? "var(--danger)" : "#065f46",
    fontSize: "0.85rem",
    marginBottom: 14,
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Organization configuration and user management</p>
        </div>
      </div>

      {error   && <div style={alertStyle("error")}>{error}</div>}
      {success && <div style={alertStyle("success")}>{success}</div>}

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Org settings */}
          {org && (
            <div className="card" style={{ padding: 22 }}>
              <p style={sectionHeaderStyle}>Organization</p>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 14 }}>
                Slug: <span className="mono" style={{ color: "var(--ink-secondary)" }}>{org.slug}</span>
              </p>
              {canUpdateOrg ? (
                <form onSubmit={updateOrgName} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1, maxWidth: 320 }}>
                    <label className="field-label">Organization Name</label>
                    <input className="input" name="org_name" defaultValue={org.name} />
                  </div>
                  <button className="btn btn-primary btn-sm" type="submit">Update</button>
                </form>
              ) : (
                <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--ink)" }}>{org.name}</p>
              )}
            </div>
          )}

          {/* Invite user */}
          {canInvite && (
            <div className="card" style={{ padding: 22 }}>
              <p style={sectionHeaderStyle}>Invite Team Member</p>
              <form onSubmit={inviteUser} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="input" name="full_name" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input className="input" name="email" placeholder="john@acme.com" type="email" required />
                </div>
                <div>
                  <label className="field-label">Temporary Password</label>
                  <input className="input" name="password" placeholder="••••••••" type="password" required />
                </div>
                <div>
                  <label className="field-label">Role</label>
                  <select className="input" name="role_name" required>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button className="btn btn-primary btn-sm" type="submit">Send Invite</button>
                </div>
              </form>
            </div>
          )}

          {/* User management */}
          {canManageUsers && users.length > 0 && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ ...sectionHeaderStyle, marginBottom: 0 }}>Team Members ({users.length})</p>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th>{(canUpdateUsers || canDeleteUsers) && <th>Actions</th>}</tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                        <td style={{ color: "var(--muted)" }}>{u.email}</td>
                        <td>
                          {canUpdateUsers ? (
                            <select className="input" style={{ padding: "4px 28px 4px 8px", fontSize: "0.78rem", width: 110 }} value={u.role_name} onChange={e => changeRole(u.id, e.target.value)}>
                              <option value="staff">Staff</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                          ) : (
                            <span className={`badge badge-${u.role_name}`}>{u.role_name}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${u.is_active ? "badge-status-completed" : "badge-status-cancelled"}`}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {(canUpdateUsers || canDeleteUsers) && (
                          <td>
                            {canDeleteUsers && u.is_active && (
                              <button className="btn btn-danger btn-sm" onClick={() => deactivateUser(u.id)}>Deactivate</button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Permission reference */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ ...sectionHeaderStyle, marginBottom: 0 }}>Role Permissions</p>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    <th style={{ textAlign: "center" }}>Owner</th>
                    <th style={{ textAlign: "center" }}>Admin</th>
                    <th style={{ textAlign: "center" }}>Manager</th>
                    <th style={{ textAlign: "center" }}>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Create Products",    true,  true,  true,  false],
                    ["Delete Products",    true,  true,  false, false],
                    ["Create Orders",      true,  true,  true,  true ],
                    ["Delete Orders",      true,  true,  false, false],
                    ["Manage Warehouses",  true,  true,  true,  false],
                    ["Delete Warehouses",  true,  true,  false, false],
                    ["Transfer Stock",     true,  true,  true,  false],
                    ["Manage Users",       true,  true,  false, false],
                    ["View Audit Log",     true,  true,  false, false],
                    ["Org Settings",       true,  false, false, false],
                  ].map(([action, ...perms]) => (
                    <tr key={String(action)}>
                      <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>{action}</td>
                      {(perms as boolean[]).map((allowed, i) => (
                        <td key={i} style={{ textAlign: "center" }}>
                          {allowed
                            ? <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                            : <span style={{ color: "var(--border-strong)" }}>—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
