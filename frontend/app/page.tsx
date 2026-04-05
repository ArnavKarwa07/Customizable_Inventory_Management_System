import Link from "next/link";
import {
  Package2,
  Building2,
  ShieldCheck,
  Package,
  BarChart2,
  ClipboardList,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: <Building2 size={20} />,
    title: "Multi-Org Architecture",
    description: "Isolated organizations with separate data, users, and configurations. Built for multi-tenant SaaS.",
    color: "#ede9fe",
    iconColor: "#6366f1",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Role-Based Access",
    description: "Four-tier permission system — Owner, Admin, Manager, Staff — with granular scope controls.",
    color: "#fef3c7",
    iconColor: "#d97706",
  },
  {
    icon: <Package size={20} />,
    title: "Full Inventory Suite",
    description: "Products, categories, suppliers, warehouses, stock adjustments, transfers, and order management.",
    color: "#d1fae5",
    iconColor: "#059669",
  },
  {
    icon: <BarChart2 size={20} />,
    title: "Real-Time Dashboard",
    description: "Live stats, low-stock alerts, and recent activity feed to keep operations running smoothly.",
    color: "#dbeafe",
    iconColor: "#3b82f6",
  },
  {
    icon: <ClipboardList size={20} />,
    title: "Audit Trail",
    description: "Every action is logged. See who did what, when, and where — full accountability out of the box.",
    color: "#fce7f3",
    iconColor: "#db2777",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Clean Interface",
    description: "Dark mode, responsive layout, and a fast, focused UI that your team can actually use daily.",
    color: "#f3e8ff",
    iconColor: "#7c3aed",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "var(--font-manrope), sans-serif" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid #e2e8f0",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "#6366f1",
            borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package2 size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", letterSpacing: "-0.01em" }}>
            StockPilot
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/login" style={{
            padding: "7px 16px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#475569",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: "#fff",
          }}>
            Sign in
          </Link>
          <Link href="/register" style={{
            padding: "7px 16px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#fff",
            borderRadius: 6,
            background: "#6366f1",
            border: "1px solid #6366f1",
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "100px 32px 80px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 12px",
          borderRadius: 999,
          background: "#ede9fe",
          color: "#6366f1",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 24,
        }}>
          <Sparkles size={12} />
          Enterprise Inventory Management
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          color: "#0f172a",
          margin: "0 0 20px",
        }}>
          Run your supply chain<br />
          <span style={{ color: "#6366f1" }}>from one platform</span>
        </h1>

        <p style={{
          fontSize: "1.05rem",
          color: "#64748b",
          lineHeight: 1.7,
          maxWidth: 540,
          margin: "0 auto 36px",
        }}>
          Multi-organization support, granular permissions, real-time inventory tracking, and full audit trails — production-ready out of the box.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#fff",
            borderRadius: 8,
            background: "#6366f1",
            border: "1px solid #6366f1",
            textDecoration: "none",
          }}>
            Create Organization
            <ArrowRight size={16} />
          </Link>
          <Link href="/login" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#475569",
            borderRadius: 8,
            background: "#fff",
            border: "1px solid #e2e8f0",
            textDecoration: "none",
          }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #e2e8f0", maxWidth: 900, margin: "0 auto" }} />

      {/* Features */}
      <section style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "72px 32px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Everything your team needs
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#64748b", margin: 0 }}>
            From receiving to fulfillment — StockPilot covers the full lifecycle.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {features.map((item) => (
            <div key={item.title} style={{
              padding: "22px",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: "#fff",
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                background: item.color,
                color: item.iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>{item.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #e2e8f0",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 900,
        margin: "0 auto",
        fontSize: "0.78rem",
        color: "#94a3b8",
      }}>
        <span>© 2026 StockPilot IMS</span>
        <span>Secure · Multi-Tenant · Production-Ready</span>
      </footer>
    </div>
  );
}
