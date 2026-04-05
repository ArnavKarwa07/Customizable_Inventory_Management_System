"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthLayout } from "@/components/auth-layout";
import { setTokens, setSession } from "@/lib/auth-storage";
import { apiClient } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const org_slug = String(form.get("org_slug") ?? "").trim().toLowerCase();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", { org_slug, email, password });
      setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      });

      const headers = { Authorization: `Bearer ${response.data.access_token}` };
      const meRes = await apiClient.get("/users/me", { headers });
      setSession({
        orgSlug: org_slug,
        orgName: meRes.data.org_name,
        userRole: meRes.data.role_name,
      });

      router.push("/dashboard");
    } catch {
      setError("Invalid organization, email, or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your organization">
      <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="org_slug" className="field-label">Organization Slug</label>
          <input
            className="input"
            id="org_slug"
            name="org_slug"
            type="text"
            placeholder="my-company"
            autoComplete="organization"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="field-label">Email address</label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 6,
            background: "var(--danger-soft)",
            border: "1px solid #fecaca",
            color: "var(--danger)",
            fontSize: "0.85rem",
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          disabled={loading}
          type="submit"
          style={{ marginTop: 4, padding: "11px", fontSize: "0.9rem" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 22, textAlign: "center", fontSize: "0.85rem", color: "var(--muted)" }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Create organization
        </Link>
      </p>
    </AuthLayout>
  );
}
