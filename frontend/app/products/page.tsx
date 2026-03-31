"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type Product = {
  id: number;
  sku: string;
  name: string;
  unit_price: number;
  low_stock_threshold: number;
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    try {
      const response = await apiClient.get<Product[]>("/products");
      setItems(response.data);
      setError("");
    } catch {
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      sku: String(form.get("sku") ?? ""),
      name: String(form.get("name") ?? ""),
      unit_price: Number(form.get("unit_price") ?? 0),
      low_stock_threshold: Number(form.get("low_stock_threshold") ?? 5),
      description: String(form.get("description") ?? "") || null,
    };

    try {
      await apiClient.post("/products", payload);
      (event.target as HTMLFormElement).reset();
      await loadProducts();
    } catch {
      setError(
        "Unable to create product. Ensure you are logged in as admin or manager.",
      );
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>

      <form
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
        onSubmit={createProduct}
      >
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="sku"
          placeholder="SKU"
          required
        />
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="name"
          placeholder="Name"
          required
        />
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="unit_price"
          placeholder="Price"
          required
          type="number"
          min="0"
          step="0.01"
        />
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2"
          name="low_stock_threshold"
          placeholder="Low stock threshold"
          type="number"
          min="0"
          defaultValue={5}
        />
        <input
          className="rounded-md border border-slate-400 bg-transparent px-3 py-2 sm:col-span-2"
          name="description"
          placeholder="Description"
        />
        <button
          className="rounded-md bg-accent px-4 py-2 font-semibold text-white sm:col-span-2"
          type="submit"
        >
          Create product
        </button>
      </form>

      {loading ? <p>Loading products...</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300/40 text-left">
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Low Stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-300/20">
                <td className="py-2 pr-4">{item.sku}</td>
                <td className="py-2 pr-4">{item.name}</td>
                <td className="py-2 pr-4">${item.unit_price.toFixed(2)}</td>
                <td className="py-2 pr-4">{item.low_stock_threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
