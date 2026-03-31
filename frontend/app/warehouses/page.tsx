"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type Warehouse = {
  id: number;
  name: string;
  code: string;
  address: string | null;
  is_active: boolean;
};

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWarehouses() {
    setLoading(true);
    try {
      const response = await apiClient.get<Warehouse[]>("/warehouses");
      setWarehouses(response.data);
      setError("");
    } catch {
      setError("Unable to load warehouses.");
    } finally {
      setLoading(false);
    }
  }

  async function createWarehouse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      code: String(form.get("code") ?? ""),
      address: String(form.get("address") ?? "") || null,
    };

    try {
      await apiClient.post("/warehouses", payload);
      (event.target as HTMLFormElement).reset();
      await loadWarehouses();
    } catch {
      setError(
        "Unable to create warehouse. Ensure you have the required permissions.",
      );
    }
  }

  async function toggleWarehouse(id: number, isActive: boolean) {
    try {
      await apiClient.patch(`/warehouses/${id}`, { is_active: !isActive });
      await loadWarehouses();
    } catch {
      setError("Unable to update warehouse.");
    }
  }

  useEffect(() => {
    void loadWarehouses();
  }, []);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Warehouses</h1>

      <form
        className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-slate-300/40 p-4 sm:grid-cols-3"
        onSubmit={createWarehouse}
      >
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="name"
          placeholder="Warehouse Name"
          required
        />
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="code"
          placeholder="Code"
          required
        />
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="address"
          placeholder="Address (optional)"
        />
        <button
          className="rounded-md bg-accent px-4 py-2 font-semibold text-white sm:col-span-3"
          type="submit"
        >
          Create Warehouse
        </button>
      </form>

      {loading ? <p>Loading warehouses...</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {warehouses.map((warehouse) => (
          <article
            key={warehouse.id}
            className="rounded-lg border border-slate-300/40 p-4"
          >
            <div className="mb-3 flex items-start justify-between">
              <h2 className="font-semibold">{warehouse.name}</h2>
              <button
                onClick={() =>
                  toggleWarehouse(warehouse.id, warehouse.is_active)
                }
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  warehouse.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {warehouse.is_active ? "Active" : "Inactive"}
              </button>
            </div>
            <p className="text-sm text-muted">Code: {warehouse.code}</p>
            {warehouse.address && (
              <p className="text-sm">{warehouse.address}</p>
            )}
          </article>
        ))}
      </div>
    </AppShell>
  );
}
