"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Warehouse as WarehouseIcon } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { hasScope } from "@/lib/auth-storage";

type Warehouse = { id: number; name: string; code: string; address: string | null; is_active: boolean };

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editForm, setEditForm]     = useState<any>({});
  const canCreate = hasScope("warehouses:create");
  const canUpdate = hasScope("warehouses:update");
  const canDelete = hasScope("warehouses:delete");

  async function loadWarehouses() {
    setLoading(true);
    try {
      const response = await apiClient.get<Warehouse[]>("/warehouses");
      setWarehouses(response.data); setError("");
    } catch { setError("Unable to load warehouses."); }
    finally { setLoading(false); }
  }

  async function createWarehouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiClient.post("/warehouses", {
        name:    String(form.get("name") ?? ""),
        code:    String(form.get("code") ?? ""),
        address: String(form.get("address") ?? "") || null,
      });
      (event.target as HTMLFormElement).reset();
      await loadWarehouses();
    } catch { setError("Unable to create warehouse."); }
  }

  async function saveEdit(id: number) {
    try { await apiClient.patch(`/warehouses/${id}`, editForm); setEditingId(null); await loadWarehouses(); }
    catch { setError("Unable to update warehouse."); }
  }

  async function toggleWarehouse(id: number, isActive: boolean) {
    try { await apiClient.patch(`/warehouses/${id}`, { is_active: !isActive }); await loadWarehouses(); }
    catch { setError("Unable to update warehouse."); }
  }

  async function deleteWarehouse(id: number) {
    if (!confirm("Delete this warehouse? Only possible if it has no active inventory.")) return;
    try { await apiClient.delete(`/warehouses/${id}`); await loadWarehouses(); }
    catch (err: any) { setError(err?.response?.data?.detail ?? "Unable to delete warehouse."); }
  }

  useEffect(() => { void loadWarehouses(); }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Warehouses</h1>
          <p className="page-subtitle">Manage your storage locations</p>
        </div>
      </div>

      {canCreate && (
        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 12 }}>
            Add Warehouse
          </p>
          <form onSubmit={createWarehouse} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label className="field-label">Name</label>
              <input className="input" name="name" placeholder="Warehouse name" required />
            </div>
            <div style={{ flex: "0 1 120px" }}>
              <label className="field-label">Code</label>
              <input className="input" name="code" placeholder="WH-01" required />
            </div>
            <div style={{ flex: "2 1 240px" }}>
              <label className="field-label">Address</label>
              <input className="input" name="address" placeholder="123 Logistics Ave" />
            </div>
            <button className="btn btn-primary" type="submit" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <Plus size={15} /> Create
            </button>
          </form>
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--danger-soft)", border: "1px solid #fecaca", color: "var(--danger)", fontSize: "0.85rem", marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Loading…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {warehouses.length === 0 && (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}><p>No warehouses yet</p></div>
          )}
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className="card" style={{ padding: 18 }}>
              {editingId === warehouse.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input className="input" value={editForm.name ?? ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                  <input className="input" value={editForm.address ?? ""} onChange={e => setEditForm({ ...editForm, address: e.target.value })} placeholder="Address" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(warehouse.id)}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <WarehouseIcon size={16} color="var(--accent)" />
                      </div>
                      <div>
                        <h2 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0, color: "var(--ink)" }}>{warehouse.name}</h2>
                        <span className="mono" style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{warehouse.code}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => canUpdate ? toggleWarehouse(warehouse.id, warehouse.is_active) : undefined}
                      className={`badge ${warehouse.is_active ? "badge-status-completed" : "badge-status-cancelled"}`}
                      style={{ cursor: canUpdate ? "pointer" : "default", border: "none", background: "inherit" }}
                    >
                      {warehouse.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                  {warehouse.address && (
                    <p style={{ fontSize: "0.82rem", color: "var(--ink-secondary)", margin: "0 0 10px" }}>{warehouse.address}</p>
                  )}
                  {(canUpdate || canDelete) && (
                    <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      {canUpdate && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(warehouse.id); setEditForm({ name: warehouse.name, address: warehouse.address ?? "" }); }}>
                          Edit
                        </button>
                      )}
                      {canDelete && <button className="btn btn-danger btn-sm" onClick={() => deleteWarehouse(warehouse.id)}>Delete</button>}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
