import Link from "next/link";

export default function HomePage() {
  const highlights = [
    {
      title: "Operations Dashboard",
      description:
        "Track products, active warehouses, order flow, and low-stock risks in one place.",
    },
    {
      title: "Role-Based Access",
      description:
        "Keep control with separate permissions for admins, managers, and staff users.",
    },
    {
      title: "Reliable API Integration",
      description:
        "Token refresh and protected routes keep your sessions stable and secure.",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-16">
      <section className="animate-rise rounded-2xl border border-slate-300/40 bg-panel/80 p-8 shadow-sm">
        <p className="mono mb-3 text-sm uppercase tracking-wider text-muted">
          Client Ready Inventory Suite
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Run products, stock, warehouses, and orders from one clean control
          center.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Built for daily operations with secure authentication, role-based
          access, and responsive workflows your team can use immediately.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            className="rounded-lg bg-accent px-5 py-2 font-semibold text-white transition hover:opacity-90"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="rounded-lg border border-slate-400 px-5 py-2 font-semibold transition hover:bg-slate-100/60"
            href="/register"
          >
            Create Account
          </Link>
          <Link
            className="rounded-lg border border-slate-300/70 px-5 py-2 font-semibold transition hover:bg-slate-100/60"
            href="/dashboard"
          >
            Open Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item, index) => (
          <article
            key={item.title}
            className="animate-rise rounded-xl border border-slate-300/40 bg-panel p-5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.description}</p>
          </article>
        ))}
      </section>
      <div className="mono text-xs uppercase tracking-wide text-muted">
        Fast setup. Role-safe operations. Production-grade backend integration.
      </div>
    </main>
  );
}
