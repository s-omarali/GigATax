import { BarChart3, ClipboardList, FileCheck2, FileSpreadsheet, ReceiptText, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/onboarding", label: "Onboarding", icon: Sparkles },
  { to: "/receipts", label: "Receipt Capture", icon: ReceiptText },
  { to: "/optimization", label: "Optimization", icon: ClipboardList },
  { to: "/review", label: "Final Review", icon: FileCheck2 },
  { to: "/filing-prep", label: "Filing Prep", icon: FileSpreadsheet },
];

export function AppShell() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-[240px_1fr]">
        <aside className="bento-card p-4">
          <div className="mb-6 border-b border-slate-800 pb-4">
            <p className="text-xs uppercase tracking-widest text-neon-cyan">GigATax</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Creator Tax OS</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-neon-cyan/15 text-neon-cyan"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
