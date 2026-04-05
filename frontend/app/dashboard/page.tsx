"use client";

import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Warehouse,
  Truck,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { getSession, hasScope } from "@/lib/auth-storage";

type Stats = {
  totalProducts: number;
  lowStockAlerts: number;
  totalOrders: number;
  activeWarehouses: number;
  totalSuppliers: number;
};

type LowStockItem = {
  product_id: number;
  sku: string;
  product_name: string;
  quantity: number;
  threshold: number;
  warehouse_id: number;
};

type AuditEntry = {
  id: number;
  action: string;
  resource_type: string;
  details: string | null;
  created_at: string;
};

type StatCard = {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, lowStockAlerts: 0, totalOrders: 0, activeWarehouses: 0, totalSuppliers: 0 });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const session = typeof window !== "undefined" ? getSession() : null;

  useEffect(() => {
    async function loadDashboard() {
      try {
        const requests: Promise<any>[] = [
          apiClient.get("/products"),
          apiClient.get("/inventory/low-stock"),
          apiClient.get("/orders"),
          apiClient.get("/warehouses"),
          apiClient.get("/suppliers"),
        ];
        if (hasScope("audit:read")) {
          requests.push(apiClient.get("/audit?limit=10"));
        }

        const results = await Promise.all(requests);
        const activeWarehouses = results[3].data.filter((w: any) => w.is_active).length;

        setStats({
          totalProducts: results[0].data.length,
          lowStockAlerts: results[1].data.length,
          totalOrders: results[2].data.length,
          activeWarehouses,
          totalSuppliers: results[4].data.length,
        });
        setLowStockItems(results[1].data.slice(0, 5));
        if (results[5]) setRecentActivity(results[5].data);
        setError("");
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const statCards: StatCard[] = [
    { label: "Products",         value: stats.totalProducts,    icon: <Package size={18} />,      colorClass: "stat-indigo" },
    { label: "Low Stock Alerts", value: stats.lowStockAlerts,   icon: <AlertTriangle size={18} />, colorClass: "stat-amber"  },
    { label: "Orders",           value: stats.totalOrders,      icon: <ShoppingCart size={18} />,  colorClass: "stat-emerald"},
    { label: "Warehouses",       value: stats.activeWarehouses, icon: <Warehouse size={18} />,     colorClass: "stat-violet" },
    { label: "Suppliers",        value: stats.totalSuppliers,   icon: <Truck size={18} />,         colorClass: "stat-rose"   },
  ];

  const actionClass = (action: string) => {
    if (action.startsWith("create")) return "badge-status-completed";
    if (action.startsWith("delete")) return "badge-status-cancelled";
    return "badge-status-pending";
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          {session?.orgName && (
            <p className="page-subtitle">
              {session.orgName} · Overview
            </p>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--danger-soft)", border: "1px solid #fecaca", color: "var(--danger)", fontSize: "0.85rem", marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gap: 12,
        marginBottom: 28,
      }}>
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.colorClass}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{loading ? "—" : card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Low Stock */}
        <section className="card" style={{ overflow: "hidden" }}>
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <AlertTriangle size={15} color="var(--warning)" />
            <h2 style={{ fontWeight: 700, fontSize: "0.875rem", margin: 0, color: "var(--ink)" }}>Low Stock Alerts</h2>
            {!loading && lowStockItems.length > 0 && (
              <span className="badge badge-status-pending" style={{ marginLeft: "auto" }}>{lowStockItems.length}</span>
            )}
          </div>
          <div>
            {loading ? (
              <div style={{ padding: "20px 18px", color: "var(--muted)", fontSize: "0.875rem" }}>Loading…</div>
            ) : lowStockItems.length === 0 ? (
              <div className="empty-state">
                <p>All stock levels are healthy</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Min</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={`${item.product_id}-${item.warehouse_id}`}>
                      <td style={{ fontWeight: 600, color: "var(--ink)" }}>{item.product_name}</td>
                      <td className="mono" style={{ fontSize: "0.73rem" }}>{item.sku}</td>
                      <td><span className="badge badge-status-cancelled">{item.quantity}</span></td>
                      <td style={{ color: "var(--muted)" }}>{item.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="card" style={{ overflow: "hidden" }}>
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <ClipboardIcon />
            <h2 style={{ fontWeight: 700, fontSize: "0.875rem", margin: 0, color: "var(--ink)" }}>Recent Activity</h2>
          </div>
          <div>
            {recentActivity.length === 0 ? (
              <div className="empty-state"><p>No recent activity</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentActivity.map((entry) => (
                  <div key={entry.id} style={{
                    padding: "10px 18px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span className={`badge ${actionClass(entry.action)}`}>{entry.action}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.details ?? entry.resource_type}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.73rem", color: "var(--muted)", flexShrink: 0 }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ClipboardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}
