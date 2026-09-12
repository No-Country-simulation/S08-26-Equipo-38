// src/features/incidentes/components/IncidentesView.tsx — adaptado de modelo1
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Incident, Unit } from "@/lib/types";
import { Card, SectionHeader, Btn, EmptyState, KpiCard } from "@/lib/primitives";
import { Icon, incidentStatusStyle, priorityStyle, StatusBadge, relativeTime } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

export function IncidentesView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit } = useApp();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setLocalView] = useState<"board" | "list">("board");
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.incidents(), api.units({ buildingId: selectedBuildingId ?? undefined })])
      .then(([i, u]) => { setIncidents(i); setUnits(u); }).finally(() => setLoading(false));
  };
  useEffect(load, [selectedBuildingId]);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = incidents.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    if (filterPriority && i.priority !== filterPriority) return false;
    if (search) { const nq = norm(search); return norm(i.title).includes(nq) || norm(String(i.code)).includes(nq) || norm(i.unit?.label ?? "").includes(nq); }
    return true;
  });

  const cols = [
    { key: "OPEN", label: "Abiertos", color: "#f43f5e" },
    { key: "IN_PROGRESS", label: "En Proceso", color: "#06b6d4" },
    { key: "RESOLVED", label: "Resueltos", color: "#34d399" },
    { key: "CLOSED", label: "Cerrados", color: "#94a3b8" },
  ];
  const stats = { total: filtered.length, open: filtered.filter((i) => i.status === "OPEN").length, inProgress: filtered.filter((i) => i.status === "IN_PROGRESS").length, urgent: filtered.filter((i) => i.priority === "URGENT" && ["OPEN", "IN_PROGRESS"].includes(i.status)).length };
  const openUnit = (uid: string) => { setSelectedUnit(uid); navigate("/vista360"); };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(251,191,36,0.10)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#fbbf24] font-mono text-[11px]" style={{ background: "#2a292f" }}>OPERACIÓN</span></div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Incidentes & Mantenimiento</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">Trazabilidad de solicitudes, incidentes y mantenimientos con SLA y responsables asignados.</p>
          </div>
          <Btn variant="primary" icon="add" onClick={() => setShowNew(true)}>Reportar incidente</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total" value={stats.total} icon="summarize" iconColor="#c0c1ff" iconBg="rgba(192,193,255,0.12)" sub="Todos los estados" />
        <KpiCard label="Abiertos" value={stats.open} icon="error" iconColor="#f43f5e" iconBg="rgba(244,63,94,0.12)" sub="Requieren asignación" />
        <KpiCard label="En Proceso" value={stats.inProgress} icon="progress_activity" iconColor="#06b6d4" iconBg="rgba(6,182,212,0.12)" sub="Siendo atendidos" />
        <KpiCard label="Urgentes Activos" value={stats.urgent} icon="priority_high" iconColor="#fbbf24" iconBg="rgba(251,191,36,0.12)" sub="Prioridad alta" />
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative"><Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#908fa0]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar incidente..." className="w-36 bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[12px] pl-7 pr-2 py-1.5 rounded-md border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
            <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Tipo:</span>
            {[{ v: "", l: "Todos" }, { v: "MAINTENANCE", l: "Mant." }, { v: "INCIDENT", l: "Incidente" }, { v: "COMPLAINT", l: "Reclamo" }].map((t) => (
              <button key={t.v} onClick={() => setFilterType(t.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", filterType === t.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{t.l}</button>
            ))}
            <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold ml-2">Prioridad:</span>
            {[{ v: "", l: "Todas" }, { v: "URGENT", l: "Urgente" }, { v: "HIGH", l: "Alta" }, { v: "NORMAL", l: "Normal" }, { v: "LOW", l: "Baja" }].map((p) => (
              <button key={p.v} onClick={() => setFilterPriority(p.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", filterPriority === p.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{p.l}</button>
            ))}
          </div>
          <div className="flex items-center p-0.5 rounded-lg border" style={{ background: "#0e0e13", borderColor: "rgba(255,255,255,0.08)" }}>
            <button onClick={() => setLocalView("board")} className={clsx("p-1.5 rounded", view === "board" ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#908fa0]")}><Icon name="view_kanban" className="text-[16px]" /></button>
            <button onClick={() => setLocalView("list")} className={clsx("p-1.5 rounded", view === "list" ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#908fa0]")}><Icon name="view_list" className="text-[16px]" /></button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />)}</div>
      ) : view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cols.map((col) => {
            const items = filtered.filter((i) => i.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-2" style={{ opacity: col.key === "CLOSED" ? 0.55 : 1 }}>
                <div className="flex items-center gap-2 px-1 pb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-[13px] font-semibold text-[#e4e1e9]">{col.label}</span>
                  <span className="text-[11px] font-mono text-[#908fa0]">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2 min-h-[6rem]">
                  {items.length === 0 ? (
                    <div className="rounded-lg p-4 text-center text-[12px] text-[#64748b]" style={{ background: "#1a1a24", border: "1px dashed rgba(255,255,255,0.06)" }}>Vacío</div>
                  ) : items.map((inc) => {
                    const pr = priorityStyle(inc.priority);
                    const accentColor = inc.priority === "URGENT" ? "#f43f5e" : inc.priority === "HIGH" ? "#fbbf24" : col.color;
                    const nextStatus: { label: string; value: string; icon: string; cls: string } | null =
                      inc.status === "OPEN" ? { label: "Iniciar", value: "IN_PROGRESS", icon: "play_arrow", cls: "bg-[#6366f1]/15 text-[#c0c1ff]" } :
                      inc.status === "IN_PROGRESS" ? { label: "Resolver", value: "RESOLVED", icon: "check", cls: "bg-brand-gradient text-white" } :
                      inc.status === "RESOLVED" ? { label: "Cerrar", value: "CLOSED", icon: "lock", cls: "bg-[#2a292f] text-[#c7c4d7]" } : null;
                    return (
                      <div key={inc.id} className="relative rounded-lg p-3 pl-4 flex flex-col gap-2 cursor-pointer hover:border-[#6366f1]/40 hover:-translate-y-0.5 transition-all overflow-hidden" style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.06)", minHeight: "12rem" }} onClick={() => openUnit(inc.unitId)}>
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accentColor }} />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-bold" style={{ color: col.color }}>#{inc.code}</span>
                          <StatusBadge style={pr} />
                        </div>
                        <span className="text-[13px] font-semibold text-[#e4e1e9] line-clamp-2 leading-snug min-h-[2.5rem]">{inc.title}</span>
                        <p className="text-[11px] text-[#c7c4d7] line-clamp-2 min-h-[2rem]">{inc.description || "Sin descripción"}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#908fa0] pt-1 border-t mt-auto" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <Icon name="apartment" className="text-[11px]" /><span className="truncate">{inc.unit?.label ?? "—"}</span><span className="text-[#464554]">·</span><span>{relativeTime(inc.createdAt)}</span>
                        </div>
                        {nextStatus && (
                          <button onClick={(e) => { e.stopPropagation(); api.patchIncident(inc.id, { status: nextStatus.value as any }).then(() => { load(); toast.success("Estado actualizado"); }); }} className={clsx("mt-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-semibold transition-all", nextStatus.cls)}>
                            <Icon name={nextStatus.icon} className="text-[12px]" />{nextStatus.label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-[#908fa0] border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {["#", "Título", "Unidad", "Tipo", "Prioridad", "Estado", "Asignado", "Reportado"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((inc) => {
                  const st = incidentStatusStyle(inc.status); const pr = priorityStyle(inc.priority);
                  return (
                    <tr key={inc.id} onClick={() => openUnit(inc.unitId)} className="cursor-pointer hover:bg-[#1f1f24] border-b transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3"><span className="font-mono font-bold text-[#c0c1ff]">#{inc.code}</span></td>
                      <td className="px-4 py-3 text-[#e4e1e9] font-medium">{inc.title}</td>
                      <td className="px-4 py-3 text-[#c7c4d7] font-mono">{inc.unit?.label ?? "—"}</td>
                      <td className="px-4 py-3 text-[#c7c4d7]">{inc.type === "MAINTENANCE" ? "Mant." : inc.type === "INCIDENT" ? "Inc." : "Recl."}</td>
                      <td className="px-4 py-3"><StatusBadge style={pr} /></td>
                      <td className="px-4 py-3"><StatusBadge style={st} /></td>
                      <td className="px-4 py-3 text-[#c7c4d7]">{inc.assignedTo ?? "—"}</td>
                      <td className="px-4 py-3 text-[#908fa0] font-mono">{relativeTime(inc.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in" style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }} onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden animate-scale-in" style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
            <NewIncidentModal units={units} onClose={() => setShowNew(false)} onCreated={() => { load(); setShowNew(false); toast.success("Incidente reportado"); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function NewIncidentModal({ units, onClose, onCreated }: { units: Unit[]; onClose: () => void; onCreated: () => void }) {
  const [unitId, setUnitId] = useState(""); const [type, setType] = useState("MAINTENANCE"); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [priority, setPriority] = useState("NORMAL"); const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!unitId || !title) { toast.error("Completa unidad y título"); return; }
    setSaving(true);
    try { await api.createIncident({ unitId, type, title, description, priority }); onCreated(); }
    catch { toast.error("No se pudo crear"); } finally { setSaving(false); }
  };
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-[#fbbf24]/15"><Icon name="handyman" className="text-[18px] text-[#fbbf24]" /></div><h3 className="text-[16px] font-semibold text-[#e4e1e9]">Reportar incidente / mantenimiento</h3></div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]"><Icon name="close" className="text-[18px]" /></button>
      </div>
      <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Unidad</label><select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }}><option value="">Seleccionar...</option>{units.map((u) => <option key={u.id} value={u.id}>{u.label} — {u.tower}</option>)}</select></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Tipo</label><select value={type} onChange={(e) => setType(e.target.value)} className="bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }}><option value="MAINTENANCE">Mantenimiento</option><option value="INCIDENT">Incidente</option><option value="COMPLAINT">Reclamo</option></select></div>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Título</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Goteo en baño principal" className="bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Descripción</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detalla el problema..." className="bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1] resize-none" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Prioridad</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[{ v: "LOW", l: "Baja", c: "#94a3b8" }, { v: "NORMAL", l: "Normal", c: "#06b6d4" }, { v: "HIGH", l: "Alta", c: "#fbbf24" }, { v: "URGENT", l: "Urgente", c: "#f43f5e" }].map((p) => (
              <button key={p.v} onClick={() => setPriority(p.v)} className={clsx("px-3 py-1.5 rounded text-[11px] font-semibold border transition-all flex items-center gap-1.5", priority === p.v ? "text-white" : "bg-[#1b1b20] text-[#c7c4d7]")} style={priority === p.v ? { background: p.c, borderColor: p.c } : { borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.c }} />{p.l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn variant="primary" icon="check" onClick={submit} disabled={saving}>{saving ? "Creando..." : "Crear reporte"}</Btn>
      </div>
    </>
  );
}
