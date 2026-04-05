"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { hasScope } from "@/lib/auth-storage";

type Order = {
  id: number; order_number: string; status: string;
  warehouse_id: number; created_by_user_id: number;
  notes: string | null; created_at: string;
  items: { id: number; product_id: number; quantity: number; unit_price: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [products, setProducts]     = useState<{ id: number; name: string; sku: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const canCreate = hasScope("orders:create");
  const canUpdate = hasScope("orders:update");
  const canDelete = hasScope("orders:delete");

  async function loadData() {
    setLoading(true);
    try {
      const [ordersRes, productsRes, warehousesRes] = await Promise.all([
        apiClient.get<Order[]>("/orders"),
        apiClient.get("/products"),
        apiClient.get("/warehouses"),
      ]);
      setOrders(ordersRes.data); setProducts(productsRes.data); setWarehouses(warehousesRes.data); setError("");
    } catch { setError("Failed to load data."); }
    finally { setLoading(false); }
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const warehouseId = Number(form.get("warehouse_id"));
    const productId   = Number(form.get("product_id"));
    const quantity    = Number(form.get("quantity"));
    if (!warehouseId || !productId || !quantity) { setError("Please fill all fields"); return; }
    try {
      await apiClient.post("/orders", { warehouse_id: warehouseId, items: [{ product_id: productId, quantity }] });
      (event.target as HTMLFormElement).reset();
      await loadData();
    } catch { setError("Failed to create order"); }
  }

  async function updateStatus(orderId: number, newStatus: string) {
    try { await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus }); await loadData(); }
    catch { setError("Failed to update order"); }
  }

  async function deleteOrder(orderId: number) {
    if (!confirm("Delete this draft order?")) return;
    try { await apiClient.delete(`/orders/${orderId}`); await loadData(); }
    catch (err: any) { setError(err?.response?.data?.detail ?? "Failed to delete order"); }
  }

  useEffect(() => { void loadData(); }, []);

  const statusBadge = (s: string) => `badge badge-status-${s}`;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">Create and track purchase orders</p>
        </div>
      </div>

      {canCreate && (
        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 12 }}>
            New Order
          </p>
          <form onSubmit={createOrder} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, alignItems: "flex-end" }}>
            <div>
              <label className="field-label">Warehouse</label>
              <select className="input" name="warehouse_id" required>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Product</label>
              <select className="input" name="product_id" required>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Quantity</label>
              <input className="input" name="quantity" placeholder="e.g. 50" type="number" min="1" required />
            </div>
            <div>
              <button className="btn btn-primary" type="submit" style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                <Plus size={15} /> Create Order
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
          <div style={{ padding: 20, color: "var(--muted)", fontSize: "0.875rem" }}>Loading orders…</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Order #</th><th>Status</th><th>Warehouse</th><th>Created</th>
                  {(canUpdate || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={6}><div className="empty-state"><p>No orders yet</p></div></td></tr>}
                {orders.map((order) => {
                  const wh = warehouses.find(w => w.id === order.warehouse_id);
                  return (
                    <>
                      <tr key={order.id}>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "3px 6px", minWidth: 0 }}
                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          >
                            {expandedId === order.id
                              ? <ChevronDown size={13} />
                              : <ChevronRight size={13} />}
                          </button>
                        </td>
                        <td className="mono" style={{ fontWeight: 600, fontSize: "0.8rem" }}>{order.order_number}</td>
                        <td><span className={statusBadge(order.status)}>{order.status}</span></td>
                        <td>{wh?.name ?? `#${order.warehouse_id}`}</td>
                        <td style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{new Date(order.created_at).toLocaleDateString()}</td>
                        {(canUpdate || canDelete) && (
                          <td>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              {canUpdate && (
                                <select
                                  className="input"
                                  style={{ padding: "4px 28px 4px 8px", fontSize: "0.75rem", width: 120 }}
                                  value={order.status}
                                  onChange={e => updateStatus(order.id, e.target.value)}
                                >
                                  <option value="draft">Draft</option>
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              )}
                              {canDelete && order.status === "draft" && (
                                <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(order.id)}>Delete</button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                      {expandedId === order.id && order.items.length > 0 && (
                        <tr key={`${order.id}-detail`}>
                          <td colSpan={6} style={{ padding: "0 16px 14px 56px", background: "var(--surface)" }}>
                            <div style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: 4 }}>
                              <p style={{ fontWeight: 600, color: "var(--muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0 6px" }}>
                                Order Items
                              </p>
                              {order.items.map(item => {
                                const prod = products.find(p => p.id === item.product_id);
                                return (
                                  <div key={item.id} style={{ display: "flex", gap: 20, padding: "6px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                                    <span style={{ fontWeight: 600, color: "var(--ink)", flex: 1 }}>{prod?.name ?? `#${item.product_id}`}</span>
                                    <span style={{ color: "var(--muted)" }}>×{item.quantity}</span>
                                    <span style={{ color: "var(--muted)" }}>${item.unit_price.toFixed(2)} ea.</span>
                                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>${(item.quantity * item.unit_price).toFixed(2)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
