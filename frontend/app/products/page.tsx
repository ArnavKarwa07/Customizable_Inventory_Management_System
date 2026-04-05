"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { hasScope } from "@/lib/auth-storage";

type Product = {
  id: number; sku: string; name: string; description: string | null;
  unit_price: number; low_stock_threshold: number; is_active: boolean;
  category_id: number | null; supplier_id: number | null;
  category_name: string | null; supplier_name: string | null;
};
type Category = { id: number; name: string };
type Supplier  = { id: number; name: string };

export default function ProductsPage() {
  const [items, setItems]           = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers]   = useState<Supplier[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editForm, setEditForm]     = useState<any>({});
  const canCreate = hasScope("products:create");
  const canUpdate = hasScope("products:update");
  const canDelete = hasScope("products:delete");

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, cRes, sRes] = await Promise.all([
        apiClient.get<Product[]>("/products"),
        apiClient.get<Category[]>("/categories"),
        apiClient.get<Supplier[]>("/suppliers"),
      ]);
      setItems(pRes.data); setCategories(cRes.data); setSuppliers(sRes.data); setError("");
    } catch { setError("Unable to load products."); }
    finally { setLoading(false); }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: any = {
      sku: String(form.get("sku") ?? ""),
      name: String(form.get("name") ?? ""),
      unit_price: Number(form.get("unit_price") ?? 0),
      low_stock_threshold: Number(form.get("low_stock_threshold") ?? 5),
      description: String(form.get("description") ?? "") || null,
    };
    const catId = form.get("category_id");
    const supId = form.get("supplier_id");
    if (catId) payload.category_id = Number(catId);
    if (supId) payload.supplier_id = Number(supId);
    try {
      await apiClient.post("/products", payload);
      (event.target as HTMLFormElement).reset();
      await loadData();
    } catch { setError("Unable to create product."); }
  }

  async function saveEdit(id: number) {
    try { await apiClient.patch(`/products/${id}`, editForm); setEditingId(null); await loadData(); }
    catch { setError("Unable to update product."); }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;
    try { await apiClient.delete(`/products/${id}`); await loadData(); }
    catch { setError("Unable to delete product."); }
  }

  useEffect(() => { void loadData(); }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
      </div>

      {/* Create form */}
      {canCreate && (
        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14 }}>
            Add Product
          </p>
          <form onSubmit={createProduct} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 10,
          }}>
            <div><label className="field-label">SKU</label><input className="input" name="sku" placeholder="SKU-001" required /></div>
            <div><label className="field-label">Name</label><input className="input" name="name" placeholder="Product Name" required /></div>
            <div><label className="field-label">Price</label><input className="input" name="unit_price" placeholder="0.00" type="number" min="0" step="0.01" required /></div>
            <div><label className="field-label">Low stock threshold</label><input className="input" name="low_stock_threshold" placeholder="5" type="number" min="0" defaultValue={5} /></div>
            <div>
              <label className="field-label">Category</label>
              <select className="input" name="category_id">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Supplier</label>
              <select className="input" name="supplier_id">
                <option value="">None</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="field-label">Description</label>
              <input className="input" name="description" placeholder="Optional description" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button className="btn btn-primary" type="submit" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={15} /> Add Product
              </button>
            </div>
          </form>
        </section>
      )}

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--danger-soft)", border: "1px solid #fecaca", color: "var(--danger)", fontSize: "0.85rem", marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, color: "var(--muted)", fontSize: "0.875rem" }}>Loading products…</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th><th>Name</th><th>Price</th><th>Low Stock</th>
                  <th>Category</th><th>Supplier</th><th>Active</th>
                  {(canUpdate || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan={8}><div className="empty-state"><p>No products yet</p></div></td></tr>
                )}
                {items.map((item) => (
                  <tr key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <td className="mono" style={{ fontSize: "0.73rem" }}>{item.sku}</td>
                        <td><input className="input" style={{ padding: "4px 8px", fontSize: "0.8rem" }} value={editForm.name ?? ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></td>
                        <td><input className="input" style={{ padding: "4px 8px", fontSize: "0.8rem", width: 80 }} type="number" value={editForm.unit_price ?? 0} onChange={e => setEditForm({ ...editForm, unit_price: Number(e.target.value) })} /></td>
                        <td><input className="input" style={{ padding: "4px 8px", fontSize: "0.8rem", width: 60 }} type="number" value={editForm.low_stock_threshold ?? 5} onChange={e => setEditForm({ ...editForm, low_stock_threshold: Number(e.target.value) })} /></td>
                        <td style={{ color: "var(--muted)" }}>{item.category_name ?? "—"}</td>
                        <td style={{ color: "var(--muted)" }}>{item.supplier_name ?? "—"}</td>
                        <td><span className={`badge ${item.is_active ? "badge-status-completed" : "badge-status-cancelled"}`}>{item.is_active ? "Active" : "Inactive"}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(item.id)}>Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="mono" style={{ fontSize: "0.73rem", color: "var(--muted)" }}>{item.sku}</td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>{item.low_stock_threshold}</td>
                        <td>{item.category_name ?? <span className="text-muted">—</span>}</td>
                        <td>{item.supplier_name ?? <span className="text-muted">—</span>}</td>
                        <td><span className={`badge ${item.is_active ? "badge-status-completed" : "badge-status-cancelled"}`}>{item.is_active ? "Active" : "Inactive"}</span></td>
                        {(canUpdate || canDelete) && (
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              {canUpdate && (
                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(item.id); setEditForm({ name: item.name, unit_price: item.unit_price, low_stock_threshold: item.low_stock_threshold }); }}>
                                  Edit
                                </button>
                              )}
                              {canDelete && (
                                <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(item.id)}>Delete</button>
                              )}
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
