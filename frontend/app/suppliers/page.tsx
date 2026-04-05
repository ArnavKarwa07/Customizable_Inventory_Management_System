"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { hasScope } from "@/lib/auth-storage";

type Supplier = { id: number; name: string; contact_email: string | null; phone: string | null; address: string | null; is_active: boolean; created_at: string };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm]   = useState<any>({});
  const canCreate = hasScope("suppliers:create");
  const canUpdate = hasScope("suppliers:update");
  const canDelete = hasScope("suppliers:delete");

  async function loadSuppliers() {
    setLoading(true);
    try {
      const res = await apiClient.get<Supplier[]>("/suppliers");
      setSuppliers(res.data); setError("");
    } catch { setError("Unable to load suppliers."); }
    finally { setLoading(false); }
  }

  async function createSupplier(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiClient.post("/suppliers", {
        name:          String(form.get("name") ?? ""),
        contact_email: String(form.get("contact_email") ?? "") || null,
        phone:         String(form.get("phone") ?? "") || null,
        address:       String(form.get("address") ?? "") || null,
      });
      (e.target as HTMLFormElement).reset();
      await loadSuppliers();
    } catch { setError("Unable to create supplier."); }
  }

  async function saveEdit(id: number) {
    try { await apiClient.patch(`/suppliers/${id}`, editForm); setEditingId(null); await loadSuppliers(); }
    catch { setError("Unable to update supplier."); }
  }

  async function deleteSupplier(id: number) {
    if (!confirm("Delete this supplier?")) return;
    try { await apiClient.delete(`/suppliers/${id}`); await loadSuppliers(); }
    catch { setError("Unable to delete supplier."); }
  }

  useEffect(() => { void loadSuppliers(); }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Suppliers</h1>
          <p className="page-subtitle">Manage your vendor and supplier contacts</p>
        </div>
      </div>

      {canCreate && (
        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 12 }}>
            Add Supplier
          </p>
          <form onSubmit={createSupplier} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, alignItems: "flex-end" }}>
            <div><label className="field-label">Name</label><input className="input" name="name" placeholder="Supplier name" required /></div>
            <div><label className="field-label">Email</label><input className="input" name="contact_email" placeholder="supplier@example.com" type="email" /></div>
            <div><label className="field-label">Phone</label><input className="input" name="phone" placeholder="+1 555 0100" /></div>
            <div><label className="field-label">Address</label><input className="input" name="address" placeholder="123 Main St" /></div>
            <div>
              <button className="btn btn-primary" type="submit" style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                <Plus size={15} /> Add Supplier
              </button>
            </div>
          </form>
        </div>
      )}

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
                  <th>Name</th><th>Email</th><th>Phone</th><th>Status</th>
                  {(canUpdate || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 && <tr><td colSpan={5}><div className="empty-state"><p>No suppliers yet</p></div></td></tr>}
                {suppliers.map(s => (
                  <tr key={s.id}>
                    {editingId === s.id ? (
                      <>
                        <td><input className="input" style={{ padding: "4px 8px", fontSize: "0.8rem" }} value={editForm.name ?? ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></td>
                        <td><input className="input" style={{ padding: "4px 8px", fontSize: "0.8rem" }} value={editForm.contact_email ?? ""} onChange={e => setEditForm({ ...editForm, contact_email: e.target.value })} /></td>
                        <td><input className="input" style={{ padding: "4px 8px", fontSize: "0.8rem" }} value={editForm.phone ?? ""} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></td>
                        <td><span className={`badge ${s.is_active ? "badge-status-completed" : "badge-status-cancelled"}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(s.id)}>Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.contact_email ?? <span className="text-muted">—</span>}</td>
                        <td>{s.phone ?? <span className="text-muted">—</span>}</td>
                        <td><span className={`badge ${s.is_active ? "badge-status-completed" : "badge-status-cancelled"}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
                        {(canUpdate || canDelete) && (
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              {canUpdate && (
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(s.id); setEditForm({ name: s.name, contact_email: s.contact_email ?? "", phone: s.phone ?? "" }); }}>
                                  Edit
                                </button>
                              )}
                              {canDelete && <button className="btn btn-danger btn-sm" onClick={() => deleteSupplier(s.id)}>Delete</button>}
                            </div>
                          </td>
                        )}
                      </>
                    )}
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
