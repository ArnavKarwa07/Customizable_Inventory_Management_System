"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Tag } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { hasScope } from "@/lib/auth-storage";

type Category = { id: number; name: string; description: string | null; created_at: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editForm, setEditForm]     = useState<any>({});
  const canCreate = hasScope("categories:create");
  const canUpdate = hasScope("categories:update");
  const canDelete = hasScope("categories:delete");

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await apiClient.get<Category[]>("/categories");
      setCategories(res.data); setError("");
    } catch { setError("Unable to load categories."); }
    finally { setLoading(false); }
  }

  async function createCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiClient.post("/categories", {
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? "") || null,
      });
      (e.target as HTMLFormElement).reset();
      await loadCategories();
    } catch { setError("Unable to create category."); }
  }

  async function saveEdit(id: number) {
    try { await apiClient.patch(`/categories/${id}`, editForm); setEditingId(null); await loadCategories(); }
    catch { setError("Unable to update category."); }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;
    try { await apiClient.delete(`/categories/${id}`); await loadCategories(); }
    catch { setError("Unable to delete category."); }
  }

  useEffect(() => { void loadCategories(); }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p className="page-subtitle">Organise products into groups</p>
        </div>
      </div>

      {canCreate && (
        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 12 }}>
            New Category
          </p>
          <form onSubmit={createCategory} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label className="field-label">Name</label>
              <input className="input" name="name" placeholder="Category name" required />
            </div>
            <div style={{ flex: "2 1 240px" }}>
              <label className="field-label">Description</label>
              <input className="input" name="description" placeholder="Optional description" />
            </div>
            <button className="btn btn-primary" type="submit" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <Plus size={15} /> Add
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {categories.length === 0 && (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}><p>No categories yet</p></div>
          )}
          {categories.map(cat => (
            <div key={cat.id} className="card" style={{ padding: 18 }}>
              {editingId === cat.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input className="input" value={editForm.name ?? ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                  <input className="input" value={editForm.description ?? ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(cat.id)}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Tag size={15} color="var(--accent)" />
                    </div>
                    <div>
                      <h2 style={{ fontWeight: 700, fontSize: "0.9rem", margin: "0 0 2px", color: "var(--ink)" }}>{cat.name}</h2>
                      {cat.description && (
                        <p style={{ fontSize: "0.82rem", color: "var(--ink-secondary)", margin: 0, lineHeight: 1.5 }}>{cat.description}</p>
                      )}
                    </div>
                  </div>
                  {(canUpdate || canDelete) && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      {canUpdate && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, description: cat.description ?? "" }); }}>
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(cat.id)}>Delete</button>
                      )}
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
