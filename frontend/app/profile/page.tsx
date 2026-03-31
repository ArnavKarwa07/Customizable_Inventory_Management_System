"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";

type UserProfile = {
  id: number;
  email: string;
  full_name: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiClient.get<UserProfile>("/users/me");
        setUser(response.data);
      } catch {
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      {loading ? <p>Loading profile...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {user && (
        <div className="max-w-md space-y-4 rounded-lg border border-slate-300/40 p-6">
          <div>
            <label className="block text-sm font-medium text-muted">
              Full Name
            </label>
            <p className="mt-1 text-lg">{user.full_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted">
              Email
            </label>
            <p className="mt-1 text-lg">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted">Role</label>
            <p className="mt-1">
              <span className="inline-block rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 capitalize">
                {user.role_name}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted">
              Status
            </label>
            <p className="mt-1">
              <span
                className={`inline-block rounded px-3 py-1 text-sm font-semibold ${
                  user.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted">
              Member Since
            </label>
            <p className="mt-1 text-sm text-muted">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-300/40">
            <p className="text-sm text-muted">Account ID: {user.id}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
