// src/features/layout/components/Navbar.tsx
// Header completo — building selector, role switcher, notif panel, command palette trigger

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Icon } from "@/lib/ui";
import type { Notification, Role } from "@/lib/types";
import { toast } from "sonner";

const VIEW_LABELS: Record<string, string> = {
  "/dashboard":      "Dashboard",
  "/directorio":     "Directorio de Unidades",
  "/residentes":     "Residentes y Propietarios",
  "/porteria":       "Portería & Paquetes",
  "/reservas":       "Reservas de Espacios",
  "/incidentes":     "Incidentes & Mantenimiento",
  "/vista360":       "Vista 360° por Unidad",
  "/notificaciones": "Comunicaciones",
  "/mudanzas":       "Mudanzas",
  "/timeline":       "Bitácora de Actividad",
  "/expensas":       "Expensas y Cobros",
  "/configuracion":  "Configuración",
};

const ROLES: Role[] = ["ADMIN", "PORTER", "RESIDENT"];
const ROLE_LABELS: Record<Role, string> = { ADMIN: "Admin", PORTER: "Portería", RESIDENT: "Residente" };

const ROLE_NAMES: Record<Role, string> = {
  ADMIN: "Martín Guzmán",
  PORTER: "Roberto Díaz",
  RESIDENT: "Tomás Rivera",
};

export function Navbar() {
  const location = useLocation();
  const {
    buildings, selectedBuildingId, setSelectedBuilding,
    role, setRole,
    setPaletteOpen, notifOpen, setNotifOpen,
    setMobileNavOpen,
  } = useApp();

  const [buildingOpen, setBuildingOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const pageLabel = VIEW_LABELS[location.pathname] ?? "Consola";

  // Load notifications when panel opens
  useEffect(() => {
    if (!notifOpen) return;
    setLoadingNotifs(true);
    api.notifications({ unread: true })
      .then(setNotifs)
      .catch(() => setNotifs([]))
      .finally(() => setLoadingNotifs(false));
  }, [notifOpen]);

  // Click outside to close building dropdown
  useEffect(() => {
    if (!buildingOpen) return;
    const close = () => setBuildingOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [buildingOpen]);

  const unreadCount = notifs.length;

  const markAllRead = async () => {
    try {
      await api.markAllNotifsRead();
      setNotifs([]);
      toast.success("Notificaciones marcadas como leídas");
    } catch {
      toast.error("No se pudieron actualizar las notificaciones");
    }
  };

  return (
    <header
      className="fixed top-0 h-16 z-40 flex items-center justify-between px-4 md:px-6 border-b backdrop-blur-xl"
      style={{
        left: 0,
        right: 0,
        background: "rgba(19,19,24,0.8)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* Left: hamburger (mobile) + breadcrumb + search */}
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9] transition-colors flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Icon name="menu" className="text-[22px]" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden lg:flex items-center gap-1 text-[13px] text-[#c7c4d7] flex-shrink-0">
          <span className="text-[#908fa0]">CondoTrack</span>
          <Icon name="chevron_right" className="text-[14px] text-[#908fa0]" />
          <span className="text-[#e4e1e9] font-semibold">{pageLabel}</span>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setPaletteOpen(true)}
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

      {/* Right: building selector, role switcher, notifs, profile */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Building selector */}
        <div className="relative hidden sm:block" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setBuildingOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#1b1b20] border text-[#e4e1e9] text-[13px] hover:bg-[#1f1f24] transition-all max-w-[12rem] lg:max-w-none"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Icon name="apartment" className="text-[18px] text-[#c0c1ff] flex-shrink-0" />
            <span className="font-medium truncate hidden lg:inline">
              {selectedBuilding ? selectedBuilding.name : "Todos los edificios"}
            </span>
            <span className="font-medium truncate lg:hidden">
              {selectedBuilding ? selectedBuilding.shortName : "Todos"}
            </span>
            <Icon name="expand_more" className="text-[16px] text-[#908fa0] flex-shrink-0" />
          </button>

          {buildingOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-80 rounded-xl p-1.5 z-50 animate-fade-in"
              style={{
                background: "#20202d",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 12px 32px -4px rgba(0,0,0,0.5)",
              }}
            >
              <button
                onClick={() => { setSelectedBuilding(null); setBuildingOpen(false); }}
                className={clsx(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-[13px] transition-colors",
                  !selectedBuildingId ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:bg-[#1f1f24]"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon name="layers" className="text-[16px]" />
                  Todos los edificios
                </span>
                {!selectedBuildingId && <Icon name="check" className="text-[16px]" />}
              </button>
              {buildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBuilding(b.id); setBuildingOpen(false); }}
                  className={clsx(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-[13px] transition-colors",
                    selectedBuildingId === b.id ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:bg-[#1f1f24]"
                  )}
                >
                  <span className="flex flex-col min-w-0">
                    <span className="truncate">{b.name}</span>
                    <span className="text-[11px] text-[#908fa0] font-mono">
                      {b.code} · {b._count?.units ?? b.unitsCount} unidades
                    </span>
                  </span>
                  {selectedBuildingId === b.id && <Icon name="check" className="text-[16px]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role switcher */}
        <div
          className="flex items-center p-1 rounded-lg border gap-0.5"
          style={{ background: "#0e0e13", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={clsx(
                "px-2.5 py-1 rounded text-[11px] font-semibold transition-all",
                role === r ? "bg-brand-gradient text-white shadow-sm" : "text-[#c7c4d7] hover:text-[#e4e1e9]"
              )}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={clsx(
              "relative p-1.5 rounded-lg transition-colors",
              notifOpen ? "bg-[#1f1f24] text-[#e4e1e9]" : "text-[#c7c4d7] hover:bg-[#1f1f24] hover:text-[#e4e1e9]"
            )}
          >
            <Icon name="notifications" className="text-[20px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#93000a] text-[#ffdad6] text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-96 rounded-xl z-50 animate-fade-in overflow-hidden"
              style={{
                background: "#20202d",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 12px 32px -4px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-[14px] font-semibold text-[#e4e1e9]">Notificaciones</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-[#c0c1ff] hover:underline">
                    Marcar todas leídas
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loadingNotifs ? (
                  <div className="p-6 text-center text-[13px] text-[#908fa0]">Cargando...</div>
                ) : notifs.length === 0 ? (
                  <div className="p-6 text-center text-[13px] text-[#908fa0]">Sin notificaciones nuevas</div>
                ) : (
                  notifs.map((n) => (
                    <NotifItem key={n.id} n={n} onRead={() => setNotifs((arr) => arr.filter((x) => x.id !== n.id))} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#464554]/40" />

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-[12px] font-semibold text-[#e4e1e9]">{ROLE_NAMES[role]}</span>
            <span className="text-[10px] text-[#908fa0]">{ROLE_LABELS[role]}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-[12px] font-bold ring-1 ring-[#464554]/40">
            {role === "RESIDENT" ? "TR" : role === "PORTER" ? "RD" : "MG"}
          </div>
        </div>
      </div>
    </header>
  );
}

function NotifItem({ n, onRead }: { n: Notification; onRead: () => void }) {
  const colors: Record<string, { dot: string; icon: string }> = {
    WARNING: { dot: "#fbbf24", icon: "warning" },
    SUCCESS: { dot: "#34d399", icon: "check_circle" },
    DANGER:  { dot: "#f43f5e", icon: "error" },
    INFO:    { dot: "#06b6d4", icon: "info" },
  };
  const c = colors[n.type] ?? colors.INFO;
  return (
    <button
      onClick={async () => {
        try { await api.markNotifRead(n.id); onRead(); } catch { /* ignore */ }
      }}
      className="w-full flex gap-3 px-4 py-3 text-left hover:bg-[#1f1f24] transition-colors border-b"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <Icon name={c.icon} className="text-[20px] flex-shrink-0 mt-0.5" style={{ color: c.dot }} fill />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[13px] font-medium text-[#e4e1e9]">{n.title}</span>
        <span className="text-[12px] text-[#c7c4d7] line-clamp-2">{n.message}</span>
      </div>
    </button>
  );
}
