// src/features/configuracion/components/ConfiguracionView.tsx
import { useApp } from "@/lib/store";
import { Card, SectionHeader, Btn } from "@/lib/primitives";
import { Icon } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

const ROLES = [
  { v: "ADMIN",   l: "Administrador", icon: "admin_panel_settings", color: "#c0c1ff", desc: "Acceso total al sistema" },
  { v: "PORTER",  l: "Portería",       icon: "support_agent",        color: "#4cd7f6", desc: "Paquetes, accesos y avisos" },
  { v: "RESIDENT",l: "Residente",      icon: "person",               color: "#d0bcff", desc: "Vista de tu unidad" },
];

export function ConfiguracionView() {
  const { role, setRole } = useApp();

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(99,102,241,0.12)", filter: "blur(80px)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#c0c1ff] font-mono text-[11px]" style={{ background: "#2a292f" }}>CONFIG</span></div>
          <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Configuración</h1>
          <p className="text-[14px] text-[#c7c4d7]">Preferencias del sistema y ajustes de sesión.</p>
        </div>
      </div>

      <Card>
        <SectionHeader icon="manage_accounts" iconColor="#c0c1ff" title="Rol activo" subtitle="Cambia el perfil para simular diferentes vistas" />
        <div className="flex flex-col gap-2">
          {ROLES.map((r) => (
            <button
              key={r.v}
              onClick={() => { setRole(r.v as any); toast.success(`Rol cambiado a ${r.l}`); }}
              className={clsx("w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left", role === r.v ? "border-[#6366f1]/50 bg-[#6366f1]/08" : "hover:bg-[#1f1f24]")}
              style={{ borderColor: role === r.v ? "rgba(99,102,241,0.40)" : "rgba(255,255,255,0.06)", background: role === r.v ? "rgba(99,102,241,0.08)" : "#1b1b20" }}
            >
              <div className="p-2.5 rounded-lg flex-shrink-0" style={{ background: `${r.color}15`, color: r.color }}><Icon name={r.icon} className="text-[22px]" /></div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-[#e4e1e9]">{r.l}</span>
                <span className="text-[12px] text-[#908fa0]">{r.desc}</span>
              </div>
              {role === r.v && <div className="w-2 h-2 rounded-full bg-[#6366f1] flex-shrink-0" />}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader icon="info" iconColor="#4cd7f6" title="Acerca del sistema" />
        <div className="flex flex-col gap-3 text-[13px]">
          {[
            { l: "Aplicación",  v: "CondoTrack — Sistema de gestión de condominios" },
            { l: "Versión",     v: "1.0.0-beta · S08-26-Equipo-38" },
            { l: "Backend",     v: "Spring Boot · http://localhost:8080" },
            { l: "Frontend",    v: "React 18 + Vite + Zustand + React Router v7" },
          ].map((row) => (
            <div key={row.l} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <span className="text-[#908fa0] font-medium">{row.l}</span>
              <span className="text-[#c7c4d7] font-mono text-right">{row.v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
