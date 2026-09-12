// src/features/dashboard/components/DashboardView.tsx
// Vista placeholder del Dashboard — pendiente de implementar con datos reales

import { Icon } from "../../layout/components/Icon";

const STATS = [
  { label: "Unidades totales",    value: "48",  icon: "domain",     color: "#6366f1" },
  { label: "Residentes activos",  value: "132", icon: "groups",     color: "#8b5cf6" },
  { label: "Paquetes pendientes", value: "7",   icon: "package_2",  color: "#4cd7f6" },
  { label: "Incidentes abiertos", value: "3",   icon: "handyman",   color: "#fbbf24" },
];

export function DashboardView() {
  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-[#e4e1e9] tracking-tight">
          Bienvenido, Martín 👋
        </h1>
        <p className="text-[14px] text-[#908fa0] mt-1">
          Resumen operativo del día — CondoTrack v1.0
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-list">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-xl border p-5 flex items-center gap-4 transition-all hover:border-[rgba(255,255,255,0.12)] cursor-default"
            style={{
              background: "#1a1a24",
              borderColor: "rgba(255,255,255,0.08)",
              // @ts-expect-error CSS custom property for stagger animation
              "--i": i,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${stat.color}20` }}
            >
              <Icon name={stat.icon} className="text-[22px]" style={{ color: stat.color }} fill />
            </div>
            <div>
              <div className="text-2xl font-bold tnum" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[12px] text-[#908fa0] mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder para módulos futuros */}
      <div
        className="rounded-xl border p-8 text-center animate-fade-in"
        style={{ background: "#1a1a24", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Icon name="construction" className="text-[48px] text-[#464554] mx-auto mb-3" />
        <p className="text-[14px] text-[#908fa0]">
          Módulos del dashboard en desarrollo — conectar con la API del backend
        </p>
      </div>
    </div>
  );
}
