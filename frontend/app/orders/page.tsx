"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type Order = {
  id: number;
  order_number: string;
  status: string;
  warehouse_id: number;
  created_at: string;
};

type OrderItem = {
  product_id: number;
  quantity: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<
    { id: number; name: string; sku: string }[]
  >([]);
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[]>(
    [],
  );

  async function loadData() {
    setLoading(true);
    try {
      const [ordersRes, productsRes, warehousesRes] = await Promise.all([
        apiClient.get<Order[]>("/orders"),
        apiClient.get("/products"),
        apiClient.get("/warehouses"),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
      setError("");
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const warehouseId = Number(form.get("warehouse_id"));
    const productId = Number(form.get("product_id"));
    const quantity = Number(form.get("quantity"));

    if (!warehouseId || !productId || !quantity) {
      setError("Please fill all fields");
      return;
    }

    try {
      await apiClient.post("/orders", {
        warehouse_id: warehouseId,
        items: [{ product_id: productId, quantity }],
      });
      (event.target as HTMLFormElement).reset();
      await loadData();
    } catch {
      setError("Failed to create order");
    }
  }

  async function updateStatus(orderId: number, newStatus: string) {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      await loadData();
    } catch {
      setError("Failed to update order");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Orders</h1>

      <form
        className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-slate-300/40 p-4 sm:grid-cols-3"
        onSubmit={createOrder}
      >
        <select
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="warehouse_id"
          required
        >
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="product_id"
          required
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} - {p.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="quantity"
          placeholder="Quantity"
          type="number"
          min="1"
          required
        />
        <button
          className="rounded-md bg-accent px-4 py-2 font-semibold text-white sm:col-span-3"
          type="submit"
        >
          Create Order
        </button>
      </form>

      {loading ? <p>Loading orders...</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300/40 text-left">
              <th className="py-2 pr-4">Order #</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Warehouse</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-300/20">
                <td className="py-2 pr-4 font-mono">{order.order_number}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "draft"
                          ? "bg-gray-100 text-gray-700"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-2 pr-4">{order.warehouse_id}</td>
                <td className="py-2 pr-4 text-xs text-muted">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 pr-4">
                  <select
                    className="rounded text-xs border border-slate-300"
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
