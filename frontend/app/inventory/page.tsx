"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { hasScope } from "@/lib/auth-storage";

type InventoryItem = { id: number; product_id: number; warehouse_id: number; quantity: number; updated_at: string };
type LowStockItem  = { product_id: number; sku: string; product_name: string; warehouse_id: number; quantity: number; threshold: number };
type Movement      = { id: number; product_id: number; warehouse_id: number; change: number; reason: string; created_by_user_id: number; created_at: string };
type Product       = { id: number; name: string; sku: string };
type Warehouse     = { id: number; name: string };

type Tab = "overview" | "low-stock" | "movements";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview",   label: "Stock Grid" },
  { key: "low-stock",  label: "Low Stock"  },
  { key: "movements",  label: "Movements"  },
];

export default function InventoryPage() {
  const [tab, setTab]             = useState<Tab>("overview");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock]   = useState<LowStockItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const canAdjust   = hasScope("inventory:adjust");
  const canTransfer = hasScope("inventory:transfer");

  async function loadData() {
    setLoading(true);
    try {
      const [invRes, lsRes, mvRes, pRes, wRes] = await Promise.all([
        apiClient.get<InventoryItem[]>("/inventory"),
        apiClient.get<LowStockItem[]>("/inventory/low-stock"),
        apiClient.get<Movement[]>("/inventory/movements"),
        apiClient.get<Product[]>("/products"),
        apiClient.get<Warehouse[]>("/warehouses"),
      ]);
      setInventory(invRes.data); setLowStock(lsRes.data); setMovements(mvRes.data);
      setProducts(pRes.data);   setWarehouses(wRes.data); setError("");
    } catch { setError("Unable to load inventory."); }
    finally { setLoading(false); }
  }

  async function adjustStock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiClient.post("/inventory/adjust", {
        product_id:   Number(form.get("product_id")),
        warehouse_id: Number(form.get("warehouse_id")),
        change:       Number(form.get("change")),
        reason:       String(form.get("reason")),
      });
      (e.target as HTMLFormElement).reset();
      await loadData();
    } catch (err: any) { setError(err?.response?.data?.detail ?? "Adjustment failed."); }
  }

  async function transferStock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiClient.post("/inventory/transfer", {
        product_id:        Number(form.get("product_id")),
        from_warehouse_id: Number(form.get("from_warehouse_id")),
        to_warehouse_id:   Number(form.get("to_warehouse_id")),
        quantity:          Number(form.get("quantity")),
      });
      (e.target as HTMLFormElement).reset();
      await loadData();
    } catch (err: any) { setError(err?.response?.data?.detail ?? "Transfer failed."); }
  }

  useEffect(() => { void loadData(); }, []);

  const prodName = (id: number) => products.find(p => p.id === id)?.name ?? `Product #${id}`;
  const whName   = (id: number) => warehouses.find(w => w.id === id)?.name ?? `Warehouse #${id}`;

  const formSectionStyle: React.CSSProperties = {
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="page-subtitle">Track stock levels, adjustments, and transfers</p>
        </div>
      </div>

      {/* Action forms */}
      {(canAdjust || canTransfer) && (
        <div style={{ display: "grid", gridTemplateColumns: canAdjust && canTransfer ? "1fr 1fr" : "1fr", gap: 14, marginBottom: 20 }}>
          {canAdjust && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", margin: 0 }}>
                  Stock Adjustment
                </p>
              </div>
              <form onSubmit={adjustStock} style={formSectionStyle}>
                <select className="input" name="product_id" required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                </select>
                <select className="input" name="warehouse_id" required>
                  <option value="">Select warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <input className="input" name="change" type="number" placeholder="Quantity change (e.g. +10 or -5)" required />
                <input className="input" name="reason" placeholder="Reason for adjustment" required />
                <button className="btn btn-primary btn-sm" type="submit" style={{ alignSelf: "flex-start" }}>Apply Adjustment</button>
              </form>
            </div>
          )}
          {canTransfer && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", margin: 0 }}>
                  Stock Transfer
                </p>
              </div>
              <form onSubmit={transferStock} style={formSectionStyle}>
                <select className="input" name="product_id" required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                </select>
                <select className="input" name="from_warehouse_id" required>
                  <option value="">From warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select className="input" name="to_warehouse_id" required>
                  <option value="">To warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <input className="input" name="quantity" type="number" min="1" placeholder="Quantity to transfer" required />
                <button className="btn btn-primary btn-sm" type="submit" style={{ alignSelf: "flex-start" }}>Transfer Stock</button>
              </form>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--danger-soft)", border: "1px solid #fecaca", color: "var(--danger)", fontSize: "0.85rem", marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 14, borderBottom: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: tab === t.key ? 600 : 500,
              color: tab === t.key ? "var(--accent)" : "var(--muted)",
              background: "none",
              border: "none",
              borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -1,
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 20, color: "var(--muted)", fontSize: "0.875rem" }}>Loading…</div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {tab === "overview" && (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Product</th><th>Warehouse</th><th>Quantity</th><th>Updated</th></tr></thead>
                <tbody>
                  {inventory.length === 0 && <tr><td colSpan={4}><div className="empty-state"><p>No inventory records yet</p></div></td></tr>}
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{prodName(item.product_id)}</td>
                      <td>{whName(item.warehouse_id)}</td>
                      <td><span className="badge badge-status-pending">{item.quantity}</span></td>
                      <td style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{new Date(item.updated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "low-stock" && (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Product</th><th>SKU</th><th>Warehouse</th><th>Qty</th><th>Min</th></tr></thead>
                <tbody>
                  {lowStock.length === 0 && <tr><td colSpan={5}><div className="empty-state"><p>All stock levels are healthy</p></div></td></tr>}
                  {lowStock.map(item => (
                    <tr key={`${item.product_id}-${item.warehouse_id}`}>
                      <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                      <td className="mono" style={{ fontSize: "0.73rem" }}>{item.sku}</td>
                      <td>{whName(item.warehouse_id)}</td>
                      <td><span className="badge badge-status-cancelled">{item.quantity}</span></td>
                      <td style={{ color: "var(--muted)" }}>{item.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "movements" && (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Product</th><th>Warehouse</th><th>Change</th><th>Reason</th><th>Date</th></tr></thead>
                <tbody>
                  {movements.length === 0 && <tr><td colSpan={5}><div className="empty-state"><p>No movements yet</p></div></td></tr>}
                  {movements.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{prodName(m.product_id)}</td>
                      <td>{whName(m.warehouse_id)}</td>
                      <td>
                        <span className={`badge ${m.change > 0 ? "badge-status-completed" : "badge-status-cancelled"}`}>
                          {m.change > 0 ? `+${m.change}` : m.change}
                        </span>
                      </td>
                      <td style={{ color: "var(--ink-secondary)", fontSize: "0.85rem" }}>{m.reason}</td>
                      <td style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
