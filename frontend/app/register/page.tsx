"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthLayout } from "@/components/auth-layout";
import { setTokens, setSession } from "@/lib/auth-storage";
import { apiClient } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      org_name: String(form.get("org_name") ?? "").trim(),
      org_slug: String(form.get("org_slug") ?? "").trim().toLowerCase().replace(/\s+/g, "-"),
      admin_email: String(form.get("email") ?? ""),
      admin_full_name: String(form.get("full_name") ?? ""),
      admin_password: String(form.get("password") ?? ""),
    };

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/org/create", payload);
      setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      });
      setSession({
        orgSlug: payload.org_slug,
        orgName: payload.org_name,
        userRole: "owner",
      });
      router.push("/dashboard");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to create organization.");
    } finally {
      setLoading(false);
    }
  }

  const sectionStyle: React.CSSProperties = {
    padding: "16px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--muted)",
  };

  return (
    <AuthLayout title="Create organization" subtitle="Set up your workspace and admin account">
      <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={handleSubmit}>
        {/* Organization section */}
        <div style={sectionStyle}>
          <p style={sectionLabelStyle}>Organization</p>
          <div>
            <label htmlFor="org_name" className="field-label">Organization Name</label>
            <input className="input" id="org_name" name="org_name" type="text" placeholder="Acme Inc." required />
          </div>
          <div>
            <label htmlFor="org_slug" className="field-label">Slug</label>
            <input
              className="input"
              id="org_slug"
              name="org_slug"
              type="text"
              placeholder="acme-inc"
              required
              pattern="^[a-z0-9][a-z0-9\-]{1,78}[a-z0-9]$"
              title="3-80 chars, lowercase letters, numbers, hyphens only"
            />
            <p style={{ fontSize: "0.73rem", color: "var(--muted)", marginTop: 4, margin: "4px 0 0" }}>
              Used in login. Lowercase, no spaces.
            </p>
          </div>
        </div>

        {/* Admin account section */}
        <div style={sectionStyle}>
          <p style={sectionLabelStyle}>Admin Account</p>
          <div>
            <label htmlFor="full_name" className="field-label">Full Name</label>
            <input className="input" id="full_name" name="full_name" type="text" placeholder="John Doe" required />
          </div>
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="admin@acme-inc.com" required />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input className="input" id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
          </div>
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
          style={{ padding: "11px", fontSize: "0.9rem" }}
        >
          {loading ? "Creating workspace…" : "Create Organization"}
        </button>
      </form>

      <p style={{ marginTop: 22, textAlign: "center", fontSize: "0.85rem", color: "var(--muted)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
