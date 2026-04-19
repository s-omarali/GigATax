import {
  BarChart3,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  ReceiptText,
  Zap,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard",    label: "Dashboard",       icon: BarChart3 },
  { to: "/receipts",     label: "Receipt Capture", icon: ReceiptText },
  { to: "/optimization", label: "Optimization",    icon: ClipboardList },
  { to: "/review",       label: "Final Review",    icon: FileCheck2 },
  { to: "/filing-prep",  label: "Filing Prep",     icon: FileSpreadsheet },
];

export function AppShell() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#050505" }}
    >
      {/* Ambient radial blobs — placed behind everything */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 left-1/3 w-[700px] h-[550px] rounded-full blur-[160px]"
          style={{ background: "rgba(0,255,133,0.05)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full blur-[160px]"
          style={{ background: "rgba(59,130,246,0.06)" }}
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        {/* ── Sidebar ── */}
        <aside className="sticky top-6 h-fit">
          <div
            className="bento-card p-0 overflow-hidden"
            style={{ padding: 0 }}
          >
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  background: "#00FF85",
                  boxShadow: "0 0 16px rgba(0,255,133,0.4)",
                }}
              >
                <Zap className="h-4 w-4" style={{ color: "#050505" }} fill="currentColor" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "rgba(0,255,133,0.7)" }}>
                  GigATax
                </p>
                <p className="text-[13px] font-semibold text-[#EDEDED] leading-tight">
                  Creator Tax OS
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="px-3 py-3 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                        isActive
                          ? "text-[#EDEDED]"
                          : "text-[#888888] hover:text-[#EDEDED] hover:bg-white/[0.04]"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.25)",
                          }
                        : { border: "1px solid transparent" }
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Footer hint */}
            <div className="px-5 py-4 border-t border-white/[0.05]">
              <p className="text-[11px] text-[#555555] leading-relaxed">
                Tax year <span className="text-[#888888] font-medium">2026</span>
                {" "}· Alex Rivera
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
