"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  Warehouse,
  ShoppingCart,
  BarChart2,
  User,
  Settings,
  ClipboardList,
  Package2,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { clearTokens, getSession, getTokens, hasScope } from "@/lib/auth-storage";

type Props = { children: React.ReactNode };

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  scope?: string;
};

const ICON_SIZE = 16;

function navIcon(label: string) {
  switch (label) {
    case "Dashboard":  return <LayoutDashboard size={ICON_SIZE} />;
    case "Products":   return <Package size={ICON_SIZE} />;
    case "Categories": return <Tag size={ICON_SIZE} />;
    case "Suppliers":  return <Truck size={ICON_SIZE} />;
    case "Inventory":  return <BarChart2 size={ICON_SIZE} />;
    case "Orders":     return <ShoppingCart size={ICON_SIZE} />;
    case "Warehouses": return <Warehouse size={ICON_SIZE} />;
    case "Profile":    return <User size={ICON_SIZE} />;
    case "Settings":   return <Settings size={ICON_SIZE} />;
    case "Audit Log":  return <ClipboardList size={ICON_SIZE} />;
    default:           return <ChevronRight size={ICON_SIZE} />;
  }
}

export function AppShell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userInitial, setUserInitial] = useState("U");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") ?? "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const hasToken = getTokens() !== null;
    setIsAuth(hasToken);

    const session = getSession();
    if (session) {
      setOrgName(session.orgName);
      setUserRole(session.userRole);
      setUserInitial(session.orgName.charAt(0).toUpperCase());
    }
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleLogout = () => {
    clearTokens();
    setIsAuth(false);
    router.push("/");
  };

  const authLinks: NavItem[] = [
    { href: "/dashboard",  label: "Dashboard",  icon: navIcon("Dashboard") },
    { href: "/products",   label: "Products",   icon: navIcon("Products"),   section: "Catalog" },
    { href: "/categories", label: "Categories", icon: navIcon("Categories"), scope: "categories:read" },
    { href: "/suppliers",  label: "Suppliers",  icon: navIcon("Suppliers"),  scope: "suppliers:read" },
    { href: "/inventory",  label: "Inventory",  icon: navIcon("Inventory"),  section: "Operations" },
    { href: "/orders",     label: "Orders",     icon: navIcon("Orders") },
    { href: "/warehouses", label: "Warehouses", icon: navIcon("Warehouses") },
    { href: "/profile",    label: "Profile",    icon: navIcon("Profile"),    section: "Account" },
    { href: "/settings",   label: "Settings",   icon: navIcon("Settings"),   scope: "users:read" },
    { href: "/audit",      label: "Audit Log",  icon: navIcon("Audit Log"),  scope: "audit:read" },
  ];

  const publicLinks: NavItem[] = [
    { href: "/",         label: "Home",     icon: <LayoutDashboard size={ICON_SIZE} /> },
    { href: "/login",    label: "Login",    icon: <User size={ICON_SIZE} /> },
    { href: "/register", label: "Register", icon: <Package2 size={ICON_SIZE} /> },
  ];

  const navLinks = isAuth ? authLinks : publicLinks;
  const filteredLinks = navLinks.filter((l) => !l.scope || hasScope(l.scope));

  let lastSection = "";

  if (loading) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--surface)" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 228,
        flexShrink: 0,
        background: "var(--sidebar-bg)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        borderRight: "1px solid var(--sidebar-border)",
      }}>
        {/* Logo */}
        <Link href={isAuth ? "/dashboard" : "/"} style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "20px 16px 16px",
          textDecoration: "none",
          borderBottom: "1px solid var(--sidebar-border)",
          marginBottom: 8,
        }}>
          <div style={{
            width: 30, height: 30,
            background: "var(--accent)",
            borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Package2 size={16} color="#fff" />
          </div>
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
            StockPilot
          </span>
        </Link>

        {/* Org pill */}
        {isAuth && orgName && (
          <div style={{ padding: "0 12px 12px" }}>
            <div style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 6,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <div style={{
                width: 22, height: 22,
                borderRadius: 5,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}>
                {userInitial}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{orgName}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--sidebar-text)", textTransform: "capitalize" }}>{userRole}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 8px" }}>
          {filteredLinks.map((link) => {
            const showSection = link.section && link.section !== lastSection;
            if (link.section) lastSection = link.section;
            const isActive = pathname === link.href;

            return (
              <div key={link.href}>
                {showSection && (
                  <div className="section-label">{link.section}</div>
                )}
                <Link
                  href={link.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div style={{
          padding: "12px 8px",
          borderTop: "1px solid var(--sidebar-border)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-link"
            style={{ border: "none", background: "none", width: "100%", cursor: "pointer", textAlign: "left" }}
          >
            <span style={{ opacity: 0.7, flexShrink: 0 }}>
              {theme === "light" ? <Moon size={ICON_SIZE} /> : <Sun size={ICON_SIZE} />}
            </span>
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>
          {isAuth && (
            <button
              type="button"
              onClick={handleLogout}
              className="nav-link"
              style={{ border: "none", background: "none", width: "100%", cursor: "pointer", textAlign: "left", color: "#f87171" }}
            >
              <span style={{ opacity: 0.8, flexShrink: 0 }}><LogOut size={ICON_SIZE} /></span>
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <main style={{
          flex: 1,
          padding: "32px",
          maxWidth: 1200,
          width: "100%",
        }}>
          {children}
        </main>

        <footer style={{
          padding: "16px 32px",
          borderTop: "1px solid var(--border)",
          fontSize: "0.75rem",
          color: "var(--muted)",
        }}>
          StockPilot IMS · v2.0
        </footer>
      </div>
    </div>
  );
}
