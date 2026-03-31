"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type LowStockItem = {
  product_id: number;
  sku: string;
  product_name: string;
  warehouse_id: number;
  quantity: number;
  threshold: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLowStock() {
      try {
        const response = await apiClient.get<LowStockItem[]>(
          "/inventory/low-stock",
        );
        setItems(response.data);
      } catch {
        setError("Unable to load low stock alerts.");
      } finally {
        setLoading(false);
      }
    }

    void loadLowStock();
  }, []);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Inventory Alerts</h1>
      <p className="mb-4 text-muted">
        Low stock and warehouse risk indicators.
      </p>

      {loading ? <p>Loading inventory data...</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {!loading && items.length === 0 ? <p>No low stock alerts.</p> : null}

      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <article
            key={`${item.product_id}-${item.warehouse_id}`}
            className="rounded-lg border border-slate-300/40 p-4"
          >
            <h2 className="font-semibold">{item.product_name}</h2>
            <p className="text-sm text-muted">SKU: {item.sku}</p>
            <p className="mt-2">Warehouse: {item.warehouse_id}</p>
            <p>
              Quantity: <strong>{item.quantity}</strong> / Threshold:{" "}
              <strong>{item.threshold}</strong>
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
