// src/features/layout/components/Sidebar.tsx
// Sidebar completo — adaptado de modelo1, usando React Router NavLink

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Icon } from "@/lib/ui";
import type { Role } from "@/lib/types";

const NAV_ITEMS = [
  { to: "/dashboard",      label: "Dashboard",             icon: "space_dashboard" },
  { to: "/directorio",     label: "Directorio Unidades",   icon: "domain" },
  { to: "/residentes",     label: "Residentes",            icon: "groups" },
  { to: "/porteria",       label: "Portería & Paquetes",   icon: "package_2" },
  { to: "/reservas",       label: "Reservas Espacios",     icon: "calendar_month" },
  { to: "/incidentes",     label: "Incidentes & Mant.",    icon: "handyman" },
  { to: "/mudanzas",       label: "Mudanzas",              icon: "moving" },
  { to: "/expensas",       label: "Expensas & Cobros",     icon: "payments" },
  { to: "/timeline",       label: "Bitácora Actividad",    icon: "timeline" },
  { to: "/vista360",       label: "Vista 360° Unidad",     icon: "view_in_ar",  badge: "Nuevo" },
  { to: "/notificaciones", label: "Comunicaciones",        icon: "campaign" },
] as const;

const ROLE_VIEWS: Record<Role, string[]> = {
  ADMIN:   ["/dashboard", "/directorio", "/residentes", "/porteria", "/reservas", "/incidentes", "/mudanzas", "/expensas", "/timeline", "/vista360", "/notificaciones", "/configuracion"],
  PORTER:  ["/dashboard", "/porteria", "/mudanzas", "/timeline", "/vista360", "/notificaciones"],
  RESIDENT:["/dashboard", "/vista360", "/reservas", "/expensas", "/timeline", "/notificaciones"],
};

const ROLE_LABELS: Record<Role, { label: string; initials: string }> = {
  ADMIN:   { label: "Administrador", initials: "MG" },
  PORTER:  { label: "Portería",      initials: "RD" },
  RESIDENT:{ label: "Residente",     initials: "TR" },
};

const ROLE_NAMES: Record<Role, string> = {
  ADMIN: "Martín Guzmán",
  PORTER: "Roberto Díaz",
  RESIDENT: "Tomás Rivera",
};

export function Sidebar() {
  const { role, mobileNavOpen, setMobileNavOpen } = useApp();
  const allowedViews = ROLE_VIEWS[role];
  const visibleNav = NAV_ITEMS.filter((item) => allowedViews.includes(item.to));
  const canConfig = allowedViews.includes("/configuracion");
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notifications every 30s
  useEffect(() => {
    const load = () => {
      api.notifications({ unread: true })
        .then((n) => setUnreadCount(n.length))
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ background: "rgba(15,15,20,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 h-full z-50 flex flex-col justify-between border-r transition-transform duration-300",
          "md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          width: "15rem",
          background: "#0e0e13",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col">
          <div
            className="h-16 px-4 flex items-center justify-between border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-gradient shadow-lg animate-glow-pulse">
                <Icon name="apartment" className="text-white text-[18px]" fill />
              </div>
              <span className="font-semibold tracking-tight text-[16px] text-gradient">CondoTrack</span>
            </div>
            <div className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#c7c4d7] bg-[#2a292f]">
              OPS
            </div>
          </div>

          {/* Nav */}
          <div className="px-2 pt-3">
            <div className="px-2 pb-1 text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">
              Plataforma
            </div>
            <nav className="flex flex-col gap-0.5">
              {visibleNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "relative flex items-center justify-between px-2 py-2 rounded-lg text-[14px] transition-all duration-150 group",
                      isActive
                        ? "bg-brand-gradient text-white font-semibold"
                        : "text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9]"
                    )
                  }
                  style={({ isActive }) =>
                    isActive ? { boxShadow: "0 0 16px -2px rgba(99,102,241,0.35)" } : undefined
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#4cd7f6] rounded-r"
                          style={{ boxShadow: "0 0 8px #4cd7f6" }}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <Icon
                          name={item.icon}
                          className={clsx("text-[18px] transition-transform group-hover:scale-110", isActive ? "text-[#4cd7f6]" : "")}
                          fill={isActive}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {"badge" in item && item.badge && (
                          <span
                            className={clsx(
                              "px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase",
                              isActive ? "bg-white/20 text-white" : "bg-[#571bc1] text-[#c4abff]"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.to === "/notificaciones" && unreadCount > 0 && (
                          <span
                            className={clsx(
                              "min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse",
                              isActive ? "bg-white text-[#6366f1]" : "bg-[#f43f5e] text-white"
                            )}
                            style={isActive ? undefined : { boxShadow: "0 0 8px rgba(244,63,94,0.5)" }}
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-2 pb-3 flex flex-col gap-2 border-t pt-3"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {canConfig && (
            <NavLink
              to="/configuracion"
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2 px-2 py-2 rounded-lg text-[14px] transition-all",
                  isActive
                    ? "bg-[#6366f1]/15 text-[#c0c1ff] font-semibold"
                    : "text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name="settings" className="text-[18px]" fill={isActive} />
                  <span>Configuración</span>
                </>
              )}
            </NavLink>
          )}

          <div
            className="flex items-center gap-2 p-2 rounded-xl border"
            style={{ background: "#1b1b20", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-[12px] font-bold">
                {ROLE_LABELS[role].initials}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4cd7f6] ring-2 ring-[#1b1b20]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-semibold text-[#e4e1e9] truncate">
                {ROLE_NAMES[role]}
              </span>
              <span className="text-[11px] text-[#c7c4d7] truncate flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#c0c1ff]" />
                {ROLE_LABELS[role].label}
              </span>
            </div>
            <Icon name="more_vert" className="text-[#908fa0] text-[16px]" />
          </div>
        </div>
      </aside>
    </>
  );
}
