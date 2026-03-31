"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: String(form.get("full_name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    setMessage("");
    setError("");

    try {
      await apiClient.post("/auth/register", payload);
      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 900);
    } catch {
      setError("Unable to register with provided details.");
    }
  }

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Create account</h1>
      <form className="max-w-md space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium" htmlFor="full_name">
          Full name
        </label>
        <input
          className="w-full rounded-md border border-slate-400 bg-transparent px-3 py-2"
          id="full_name"
          name="full_name"
          type="text"
          required
        />

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
          type="submit"
        >
          Register
        </button>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </AppShell>
  );
}
