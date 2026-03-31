"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type DashboardStats = {
  totalProducts: number;
  lowStockAlerts: number;
  totalOrders: number;
  activeWarehouses: number;
};

type LowStockItem = {
  product_id: number;
  sku: string;
  product_name: string;
  quantity: number;
  threshold: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockAlerts: 0,
    totalOrders: 0,
    activeWarehouses: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsRes, lowStockRes, ordersRes, warehousesRes] =
          await Promise.all([
            apiClient.get<{ id: number }[]>("/products"),
            apiClient.get<LowStockItem[]>("/inventory/low-stock"),
            apiClient.get<{ id: number }[]>("/orders"),
            apiClient.get<{ id: number; is_active: boolean }[]>("/warehouses"),
          ]);

        const activeWarehouses = warehousesRes.data.filter(
          (w) => w.is_active,
        ).length;

        setStats({
          totalProducts: productsRes.data.length,
          lowStockAlerts: lowStockRes.data.length,
          totalOrders: ordersRes.data.length,
          activeWarehouses,
        });
        setLowStockItems(lowStockRes.data.slice(0, 5));
        setError("");
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStockAlerts,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Active Warehouses",
      value: stats.activeWarehouses,
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold">Dashboard</h1>
      <p className="mb-6 text-muted">
        Welcome back! Here's your inventory overview.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className={`rounded-lg p-6 ${card.color}`}>
            <h2 className="text-sm font-medium opacity-80">{card.label}</h2>
            <p className={`mt-2 text-4xl font-bold`}>
              {loading ? "—" : card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-300/40 p-6">
        <h2 className="mb-4 text-lg font-semibold">Low Stock Alerts</h2>
        {loading ? (
          <p className="text-muted">Loading alerts...</p>
        ) : lowStockItems.length === 0 ? (
          <p className="text-muted">
            No low stock items. Everything looks good!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300/40 text-left">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">SKU</th>
                  <th className="py-2 pr-4">Current</th>
                  <th className="py-2 pr-4">Threshold</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr
                    key={`${item.product_id}`}
                    className="border-b border-slate-300/20"
                  >
                    <td className="py-3 pr-4">{item.product_name}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{item.sku}</td>
                    <td className="py-3 pr-4 font-semibold">{item.quantity}</td>
                    <td className="py-3 pr-4">{item.threshold}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-block rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
