"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearTokens, getTokens } from "@/lib/auth-storage";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialTheme = localStorage.getItem("theme") ?? "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    const hasToken = getTokens() !== null;
    setIsAuth(hasToken);
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleLogout = () => {
    clearTokens();
    setIsAuth(false);
    router.push("/");
  };

  // Authenticated navigation
  const authLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/inventory", label: "Inventory" },
    { href: "/orders", label: "Orders" },
    { href: "/warehouses", label: "Warehouses" },
    { href: "/profile", label: "Profile" },
  ];

  // Public navigation
  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
  ];

  const navLinks = isAuth ? authLinks : publicLinks;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-300/40 bg-panel/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href={isAuth ? "/dashboard" : "/"}
            className="text-lg font-semibold tracking-wide hover:opacity-80"
          >
            StockPilot IMS
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-accent px-3 py-1 text-sm"
              onClick={toggleTheme}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
            {isAuth && (
              <button
                type="button"
                className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {!loading && (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-[220px_1fr]">
          <aside className="rounded-xl border border-slate-300/40 bg-panel p-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 transition ${
                    pathname === link.href
                      ? "bg-accent text-white"
                      : "hover:bg-slate-200/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="rounded-xl border border-slate-300/40 bg-panel p-6">
            {children}
          </main>
        </div>
      )}

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-sm text-muted">
        StockPilot IMS
      </footer>
    </div>
  );
}
