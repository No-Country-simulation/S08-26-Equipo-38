// src/features/layout/components/Navbar.tsx
// Barra superior — adaptada de modelo1/header.tsx para React Router + TypeScript

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import type { Role } from "../types";

const VIEW_LABELS: Record<string, string> = {
  dashboard:      "Dashboard",
  directorio:     "Directorio de Unidades",
  residentes:     "Residentes y Propietarios",
  porteria:       "Portería & Paquetes",
  reservas:       "Reservas de Espacios",
  incidentes:     "Incidentes & Mantenimiento",
  vista360:       "Vista 360° por Unidad",
  notificaciones: "Comunicaciones",
  mudanzas:       "Mudanzas",
  timeline:       "Bitácora de Actividad",
  expensas:       "Expensas y Cobros",
  configuracion:  "Configuración",
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN:    "Admin",
  PORTER:   "Portería",
  RESIDENT: "Residente",
};

const ROLE_INITIALS: Record<Role, string> = {
  ADMIN:    "MG",
  PORTER:   "RD",
  RESIDENT: "TR",
};

const ROLE_NAMES: Record<Role, string> = {
  ADMIN:    "Martín Guzmán",
  PORTER:   "Roberto Díaz",
  RESIDENT: "Tomás Rivera",
};

// ---- Props ----
interface NavbarProps {
  role?: Role;
  onOpenMobile?: () => void;
}

export function Navbar({ role = "ADMIN", onOpenMobile }: NavbarProps) {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  // Obtiene la clave de la ruta actual para el breadcrumb
  const viewKey = location.pathname.replace("/", "") || "dashboard";
  const pageLabel = VIEW_LABELS[viewKey] ?? "Consola";

  return (
    <header
      className="fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-4 md:px-6 border-b backdrop-blur-xl"
      style={{
        left: 0,
        background: "rgba(19,19,24,0.85)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* ---- Izquierda: hamburger + breadcrumb + búsqueda ---- */}
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        {/* Botón hamburger (solo móvil) */}
        <button
          onClick={onOpenMobile}
          className="md:hidden p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9] transition-colors flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Icon name="menu" className="text-[22px]" />
        </button>

        {/* Breadcrumb (oculto en móvil pequeño) */}
        <div className="hidden lg:flex items-center gap-1 text-[13px] text-[#c7c4d7] flex-shrink-0">
          <span className="text-[#908fa0]">CondoTrack</span>
          <Icon name="chevron_right" className="text-[14px] text-[#908fa0]" />
          <span className="text-[#e4e1e9] font-semibold">{pageLabel}</span>
        </div>

        {/* Barra de búsqueda (decorativa por ahora) */}
        <button
          className="relative flex items-center w-40 sm:w-64 lg:w-80 bg-[#1b1b20] text-[#c7c4d7] text-[13px] pl-9 pr-14 py-1.5 rounded-lg border transition-all hover:border-[#6366f1]/40 flex-shrink min-w-0"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Icon name="search" className="absolute left-3 text-[#908fa0] text-[18px]" />
          <span className="text-[#908fa0] truncate hidden sm:inline">Buscar unidad, residente...</span>
          <span className="text-[#908fa0] sm:hidden">Buscar...</span>
          <div className="absolute right-2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#2a292f] border border-[#464554]/50 text-[#908fa0] font-mono text-[11px]">
            <span>⌘</span><span>K</span>
          </div>
        </button>
      </div>

      {/* ---- Derecha: rol + notificaciones + perfil ---- */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Indicador de rol */}
        <div
          className="hidden sm:flex items-center px-2.5 py-1 rounded-lg border text-[12px] font-semibold gap-1.5"
          style={{ background: "#0e0e13", borderColor: "rgba(255,255,255,0.08)", color: "#c0c1ff" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
          {ROLE_LABELS[role]}
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={`relative p-1.5 rounded-lg transition-colors ${
              notifOpen ? "bg-[#1f1f24] text-[#e4e1e9]" : "text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9]"
            }`}
          >
            <Icon name="notifications" className="text-[20px]" />
            {/* Badge de notificaciones — pendiente de conectar a API */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f43f5e]" />
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-80 rounded-xl z-50 animate-scale-in overflow-hidden"
              style={{
                background: "#20202d",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 12px 32px -4px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span className="text-[14px] font-semibold text-[#e4e1e9]">Notificaciones</span>
                <button className="text-[11px] text-[#c0c1ff] hover:underline">Marcar todas leídas</button>
              </div>
              <div className="p-6 text-center text-[13px] text-[#908fa0]">
                Sin notificaciones nuevas
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-[#464554]/40" />

        {/* Perfil */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-[12px] font-semibold text-[#e4e1e9]">{ROLE_NAMES[role]}</span>
            <span className="text-[10px] text-[#908fa0]">{ROLE_LABELS[role]}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-[12px] font-bold ring-1 ring-[#464554]/40">
            {ROLE_INITIALS[role]}
          </div>
        </div>
      </div>
    </header>
  );
}
