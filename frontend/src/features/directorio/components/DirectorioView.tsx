// src/features/directorio/components/DirectorioView.tsx — adaptado de modelo1
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Unit } from "@/lib/types";
import { Card, SectionHeader, EmptyState, Avatar } from "@/lib/primitives";
import { Icon } from "@/lib/ui";
import { clsx } from "clsx";

export function DirectorioView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit } = useApp();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [onlyOpenIncidents, setOnlyOpenIncidents] = useState(false);
  const [view, setLocalView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setLoading(true);
    api.units({ buildingId: selectedBuildingId ?? undefined }).then(setUnits).catch(() => setUnits([])).finally(() => setLoading(false));
  }, [selectedBuildingId]);

  const towers = useMemo(() => Array.from(new Set(units.map((u) => u.tower))), [units]);
  const floors = useMemo(() => Array.from(new Set(units.map((u) => u.floor))).sort((a, b) => a - b), [units]);

  const filtered = units.filter((u) => {
    if (q) {
      const ql = q.toLowerCase();
      const match = u.code.toLowerCase().includes(ql) || u.label.toLowerCase().includes(ql) || (u.residents?.[0]?.fullName ?? "").toLowerCase().includes(ql);
      if (!match) return false;
    }
    if (tower && u.tower !== tower) return false;
    if (floor && u.floor !== Number(floor)) return false;
    if (onlyPending && !(u.pendingPackages ?? 0)) return false;
    if (onlyOpenIncidents && !(u.openIncidents ?? 0)) return false;
    return true;
  });

  const stats = {
    total: units.length,
    occupied: units.filter((u) => u.occupied).length,
    pendingPkg: units.reduce((s, u) => s + (u.pendingPackages ?? 0), 0),
    openInc: units.reduce((s, u) => s + (u.openIncidents ?? 0), 0),
  };

  const openUnit = (u: Unit) => { setSelectedUnit(u.id); navigate("/vista360"); };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(99,102,241,0.12)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#c0c1ff] font-mono text-[11px]" style={{ background: "#2a292f" }}>DIRECTORIO</span></div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Directorio de Unidades</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">Inventario completo de unidades funcionales con ocupación, contactos y alertas operativas.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[20rem]">
            {[
              { label: "Unidades", value: stats.total, color: "#c0c1ff", icon: "domain" },
              { label: "Ocupadas", value: stats.occupied, color: "#34d399", icon: "check_circle" },
              { label: "Paquetes", value: stats.pendingPkg, color: "#fbbf24", icon: "inventory" },
              { label: "Incidentes", value: stats.openInc, color: "#f43f5e", icon: "handyman" },
            ].map((s) => (
              <div key={s.label} className="p-2.5 rounded-lg flex items-center gap-2" style={{ background: "#35343a" }}>
                <div className="p-1.5 rounded-md" style={{ background: `${s.color}20`, color: s.color }}><Icon name={s.icon} className="text-[16px]" /></div>
                <div className="flex flex-col">
                  <span className="text-[18px] font-semibold tnum leading-none" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[10px] text-[#c7c4d7] uppercase tracking-wider">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#908fa0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código, label o residente..." className="w-full bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select value={tower} onChange={(e) => setTower(e.target.value)} className="appearance-none bg-[#1b1b20] text-[#c7c4d7] text-[12px] pl-3 pr-8 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1] cursor-pointer" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <option value="">Torre</option>
                {towers.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#908fa0] pointer-events-none" />
            </div>
            <div className="relative">
              <select value={floor} onChange={(e) => setFloor(e.target.value)} className="appearance-none bg-[#1b1b20] text-[#c7c4d7] text-[12px] pl-3 pr-8 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1] cursor-pointer" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <option value="">Piso</option>
                {floors.map((f) => <option key={f} value={String(f)}>Piso {f}</option>)}
              </select>
              <Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#908fa0] pointer-events-none" />
            </div>
            {[
              { active: onlyPending, onClick: () => setOnlyPending((v) => !v), icon: "inventory", label: "Con paquetes" },
              { active: onlyOpenIncidents, onClick: () => setOnlyOpenIncidents((v) => !v), icon: "handyman", label: "Con incidentes" },
            ].map((chip) => (
              <button key={chip.label} onClick={chip.onClick} className={clsx("flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border transition-all", chip.active ? "bg-[#6366f1]/15 text-[#c0c1ff] border-[#6366f1]/40" : "bg-[#1b1b20] text-[#c7c4d7] hover:text-[#e4e1e9]")} style={!chip.active ? { borderColor: "rgba(255,255,255,0.08)" } : undefined}>
                <Icon name={chip.icon} className="text-[14px]" />{chip.label}
              </button>
            ))}
            <div className="flex items-center p-0.5 rounded-lg border" style={{ background: "#0e0e13", borderColor: "rgba(255,255,255,0.08)" }}>
              <button onClick={() => setLocalView("grid")} className={clsx("p-1.5 rounded", view === "grid" ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#908fa0] hover:text-[#e4e1e9]")}><Icon name="grid_view" className="text-[16px]" /></button>
              <button onClick={() => setLocalView("list")} className={clsx("p-1.5 rounded", view === "list" ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#908fa0] hover:text-[#e4e1e9]")}><Icon name="view_list" className="text-[16px]" /></button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="search_off" title="Sin unidades" sub="Ajusta los filtros para ver resultados." /></Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((u) => {
            const resident = u.residents?.[0];
            const hasAlerts = (u.pendingPackages ?? 0) > 0 || (u.openIncidents ?? 0) > 0;
            const accentColor = !u.occupied ? "#64748b" : hasAlerts ? "#fbbf24" : "#34d399";
            return (
              <div key={u.id} onClick={() => openUnit(u)} className="relative rounded-xl p-4 pl-5 cursor-pointer transition-all hover:border-[#6366f1]/40 hover:-translate-y-0.5 group overflow-hidden" style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accentColor }} />
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: u.occupied ? "rgba(99,102,241,0.15)" : "rgba(148,163,184,0.10)" }}>
                      <Icon name="apartment" className="text-[20px]" style={{ color: u.occupied ? "#c0c1ff" : "#94a3b8" }} fill />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-semibold text-[#e4e1e9]">{u.label}</span>
                      <span className="text-[11px] font-mono text-[#908fa0]">{u.code}</span>
                    </div>
                  </div>
                  {u.occupied ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(52,211,153,0.10)", color: "#34d399" }}>Ocupada</span> : <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(148,163,184,0.10)", color: "#94a3b8" }}>Libre</span>}
                </div>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {resident ? (
                    <><Avatar name={resident.fullName} color={resident.avatarColor} size={28} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-medium text-[#e4e1e9] truncate">{resident.fullName}</span>
                        <span className="text-[10px] uppercase tracking-wider text-[#908fa0]">{resident.role === "OWNER" ? "Propietario" : "Inquilino"}</span>
                      </div>
                    </>
                  ) : <span className="text-[12px] text-[#908fa0]">Sin residente</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#c7c4d7]">
                    <span className="flex items-center gap-1"><Icon name="straighten" className="text-[12px] text-[#4cd7f6]" />{u.area}m²</span>
                    <span className="text-[#464554]">·</span><span>{u.tower}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(u.pendingPackages ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-0.5" style={{ background: "rgba(251,191,36,0.10)", color: "#fbbf24" }}><Icon name="inventory" className="text-[11px]" />{u.pendingPackages}</span>}
                    {(u.openIncidents ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-0.5" style={{ background: "rgba(244,63,94,0.10)", color: "#f43f5e" }}><Icon name="handyman" className="text-[11px]" />{u.openIncidents}</span>}
                    {(u.activeReservations ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-0.5" style={{ background: "rgba(52,211,153,0.10)", color: "#34d399" }}><Icon name="calendar_month" className="text-[11px]" />{u.activeReservations}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#908fa0] border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {["Unidad", "Torre", "Piso", "Residente", "Área", "Estado", "Alertas", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} onClick={() => openUnit(u)} className="cursor-pointer hover:bg-[#1f1f24] border-b transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3"><div className="flex flex-col"><span className="font-semibold text-[#e4e1e9]">{u.label}</span><span className="text-[11px] font-mono text-[#908fa0]">{u.code}</span></div></td>
                    <td className="px-4 py-3 text-[#c7c4d7]">{u.tower}</td>
                    <td className="px-4 py-3 text-[#c7c4d7]">{u.floor}</td>
                    <td className="px-4 py-3 text-[#c7c4d7]">{u.residents?.[0]?.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-[#c7c4d7] font-mono">{u.area}m²</td>
                    <td className="px-4 py-3">{u.occupied ? <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: "rgba(52,211,153,0.10)", color: "#34d399" }}>Ocupada</span> : <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: "rgba(148,163,184,0.10)", color: "#94a3b8" }}>Desocupada</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(u.pendingPackages ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: "rgba(251,191,36,0.10)", color: "#fbbf24" }}>{u.pendingPackages} pkg</span>}
                        {(u.openIncidents ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: "rgba(244,63,94,0.10)", color: "#f43f5e" }}>{u.openIncidents} inc</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right"><Icon name="chevron_right" className="text-[16px] text-[#908fa0]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
