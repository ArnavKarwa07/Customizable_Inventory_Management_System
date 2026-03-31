"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { setTokens } from "@/lib/auth-storage";
import { apiClient } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", { email, password });
      setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      });
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      <form className="max-w-md space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md border border-slate-400 bg-transparent px-3 py-2"
          id="email"
          name="email"
          type="email"
          required
        />
        <label className="block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="w-full rounded-md border border-slate-400 bg-transparent px-3 py-2"
          id="password"
          name="password"
          type="password"
          required
        />
        <button
          className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-white"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </AppShell>
  );
}
