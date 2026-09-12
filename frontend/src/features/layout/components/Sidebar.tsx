// src/features/layout/components/Sidebar.tsx
// Sidebar de navegación — adaptado de modelo1 para React Router + TypeScript

import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import type { Role, ViewKey } from "../types";

// ---- Configuración de navegación ----
interface NavItem {
  key: ViewKey;
  label: string;
  icon: string;
  path: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",      label: "Dashboard",          icon: "space_dashboard",  path: "/dashboard" },
  { key: "directorio",     label: "Directorio Unidades",icon: "domain",           path: "/directorio" },
  { key: "residentes",     label: "Residentes",         icon: "groups",           path: "/residentes" },
  { key: "porteria",       label: "Portería & Paquetes",icon: "package_2",        path: "/porteria" },
  { key: "reservas",       label: "Reservas Espacios",  icon: "calendar_month",   path: "/reservas" },
  { key: "incidentes",     label: "Incidentes & Mant.", icon: "handyman",         path: "/incidentes" },
  { key: "mudanzas",       label: "Mudanzas",           icon: "moving",           path: "/mudanzas" },
  { key: "expensas",       label: "Expensas & Cobros",  icon: "payments",         path: "/expensas" },
  { key: "timeline",       label: "Bitácora Actividad", icon: "timeline",         path: "/timeline" },
  { key: "vista360",       label: "Vista 360° Unidad",  icon: "view_in_ar",       path: "/vista360", badge: "Nuevo" },
  { key: "notificaciones", label: "Comunicaciones",     icon: "campaign",         path: "/notificaciones" },
];

// Control de acceso por rol
const ROLE_VIEWS: Record<Role, ViewKey[]> = {
  ADMIN:    ["dashboard","directorio","residentes","porteria","reservas","incidentes","mudanzas","expensas","timeline","vista360","notificaciones","configuracion"],
  PORTER:   ["dashboard","porteria","mudanzas","timeline","vista360","notificaciones"],
  RESIDENT: ["dashboard","vista360","reservas","expensas","timeline","notificaciones"],
};

const ROLE_LABELS: Record<Role, { label: string; initials: string }> = {
  ADMIN:    { label: "Administrador", initials: "MG" },
  PORTER:   { label: "Portería",      initials: "RD" },
  RESIDENT: { label: "Residente",     initials: "TR" },
};

// ---- Props ----
interface SidebarProps {
  role?: Role;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ role = "ADMIN", mobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const allowedViews = ROLE_VIEWS[role];
  const visibleNav = NAV_ITEMS.filter((item) => allowedViews.includes(item.key));
  const canConfig = allowedViews.includes("configuracion");

  return (
    <>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          style={{ background: "rgba(15,15,20,0.7)", backdropFilter: "blur(4px)" }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 h-full z-50 flex flex-col justify-between border-r transition-transform duration-300",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        style={{ width: "15rem", background: "#0e0e13", borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* ---- Logo ---- */}
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
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#c7c4d7] bg-[#2a292f]">OPS</span>
          </div>

          {/* ---- Navegación ---- */}
          <div className="px-2 pt-3">
            <div className="px-2 pb-1 text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">
              Plataforma
            </div>
            <nav className="flex flex-col gap-0.5">
              {visibleNav.map((item) => {
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={[
                      "relative flex items-center justify-between px-2 py-2 rounded-lg text-[14px] transition-all duration-150 group w-full text-left no-underline",
                      active
                        ? "bg-brand-gradient text-white font-semibold"
                        : "text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9]",
                    ].join(" ")}
                    style={active ? { boxShadow: "0 0 16px -2px rgba(99,102,241,0.35)" } : undefined}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#4cd7f6] rounded-r"
                        style={{ boxShadow: "0 0 8px #4cd7f6" }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <Icon
                        name={item.icon}
                        className={`text-[18px] transition-transform group-hover:scale-110 ${active ? "text-[#4cd7f6]" : ""}`}
                        fill={active}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                          active ? "bg-white/20 text-white" : "bg-[#571bc1] text-[#c4abff]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ---- Footer del sidebar ---- */}
        <div
          className="px-2 pb-3 flex flex-col gap-2 border-t pt-3"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {canConfig && (
            <NavLink
              to="/configuracion"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-lg text-[14px] transition-all w-full text-left no-underline ${
                  isActive
                    ? "bg-[#6366f1]/15 text-[#c0c1ff] font-semibold"
                    : "text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9]"
                }`
              }
            >
              <Icon name="settings" className="text-[18px]" />
              <span>Configuración</span>
            </NavLink>
          )}

          {/* Perfil de usuario */}
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
                {role === "RESIDENT" ? "Tomás Rivera" : role === "PORTER" ? "Roberto Díaz" : "Martín Guzmán"}
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
