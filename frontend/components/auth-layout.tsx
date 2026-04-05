import Link from "next/link";
import { Package2 } from "lucide-react";

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--surface)",
    }}>
      {/* Left branding panel */}
      <div style={{
        display: "none",
        width: "420px",
        flexShrink: 0,
        background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 60%, #6366f1 100%)",
        padding: "48px",
        flexDirection: "column",
        justifyContent: "space-between",
      }} className="auth-branding">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 64 }}>
            <div style={{
              width: 36, height: 36,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Package2 size={20} color="#fff" />
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem" }}>StockPilot</span>
          </div>
          <h2 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
            Manage your entire supply chain from one place
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 320 }}>
            Multi-org support, role-based access, real-time stock tracking, and audit trails — built for teams that move fast.
          </p>
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
          © 2026 StockPilot. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        overflowY: "auto",
      }}>
        {/* Mobile logo */}
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 40,
          textDecoration: "none",
        }}>
          <div style={{
            width: 32, height: 32,
            background: "var(--accent)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package2 size={17} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--ink)" }}>StockPilot</span>
        </Link>

        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 6px" }}>{title}</h1>
            {subtitle && <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: 0 }}>{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>

      {/* CSS to show branding panel on wider screens */}
      <style>{`
        @media (min-width: 768px) {
          .auth-branding { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
