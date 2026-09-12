// src/features/incidentes/components/IncidentesView.tsx
// Diseño fusionado: Kanban mejorado con SLA pulsante, progreso, imagen y banner de emergencias

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Incident, Unit } from "@/lib/types";
import { Card, KpiCard, Btn, EmptyState } from "@/lib/primitives";
import { Icon, incidentStatusStyle, priorityStyle, StatusBadge, relativeTime } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

// ── Tipos helpers ─────────────────────────────────────────────────────────────

type IncidentStatus = Incident["status"];
type IncidentPriority = Incident["priority"];

const COLS: { key: IncidentStatus; label: string; color: string; dot: string; subtitle: string }[] = [
  { key: "OPEN",        label: "Abiertos",  color: "#f43f5e",  dot: "#ffb4ab", subtitle: "Requieren asignación" },
  { key: "IN_PROGRESS", label: "En Proceso", color: "#06b6d4", dot: "#4cd7f6", subtitle: "Técnico asignado" },
  { key: "RESOLVED",   label: "Resueltos",  color: "#34d399",  dot: "#c0c1ff", subtitle: "Conformidad archivada" },
];

// ── Componente principal ──────────────────────────────────────────────────────

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
      .then(([i, u]) => { setIncidents(i); setUnits(u); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [selectedBuildingId]);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = incidents.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    if (filterPriority && i.priority !== filterPriority) return false;
    if (search) {
      const nq = norm(search);
      return norm(i.title).includes(nq) || norm(String(i.code)).includes(nq) || norm(i.unit?.label ?? "").includes(nq);
    }
    return true;
  });

  const stats = {
    total: filtered.length,
    open: filtered.filter((i) => i.status === "OPEN").length,
    inProgress: filtered.filter((i) => i.status === "IN_PROGRESS").length,
    urgent: filtered.filter((i) => i.priority === "URGENT" && ["OPEN", "IN_PROGRESS"].includes(i.status)).length,
  };

  const openUnit = (uid: string) => { setSelectedUnit(uid); navigate("/vista360"); };

  const changeStatus = async (id: string, status: IncidentStatus) => {
    await api.patchIncident(id, { status });
    load();
    toast.success("Estado actualizado");
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(251,191,36,0.10)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[#fbbf24] font-mono text-[11px]" style={{ background: "#2a292f" }}>OPERACIÓN</span>
              <span className="px-2 py-0.5 rounded text-[#ffb4ab] font-mono text-[11px] flex items-center gap-1" style={{ background: "rgba(147,0,10,0.30)" }}>
                SLA 98.4%
              </span>
            </div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight flex items-center gap-3">
              Incidentes & Mantenimiento
              {stats.open > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[#ffb4ab] text-[13px] font-semibold" style={{ background: "rgba(147,0,10,0.30)" }}>
                  {stats.open} abiertos
                </span>
              )}
            </h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">
              Trazabilidad de solicitudes, incidentes y mantenimientos con SLA y responsables asignados.
            </p>
          </div>
          <Btn variant="primary" icon="add_alert" onClick={() => setShowNew(true)}>
            Reportar Incidente
          </Btn>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total" value={stats.total} icon="summarize" iconColor="#c0c1ff" iconBg="rgba(192,193,255,0.12)" sub="Todos los estados" />
        <KpiCard label="Abiertos" value={stats.open} icon="error" iconColor="#f43f5e" iconBg="rgba(244,63,94,0.12)" sub="Requieren asignación" />
        <KpiCard label="En Proceso" value={stats.inProgress} icon="progress_activity" iconColor="#06b6d4" iconBg="rgba(6,182,212,0.12)" sub="Siendo atendidos" />
        <KpiCard label="Urgentes Activos" value={stats.urgent} icon="priority_high" iconColor="#fbbf24" iconBg="rgba(251,191,36,0.12)" sub="Prioridad máxima" />
      </div>

      {/* ── Barra de filtros ── */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Búsqueda */}
            <div className="relative">
              <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#908fa0]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar incidente..."
                className="w-40 bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[12px] pl-7 pr-2 py-1.5 rounded-md border focus:outline-none focus:border-[#6366f1]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>
            {/* Filtro tipo */}
            <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Tipo:</span>
            {[{ v: "", l: "Todos" }, { v: "MAINTENANCE", l: "Mant." }, { v: "INCIDENT", l: "Incidente" }, { v: "COMPLAINT", l: "Reclamo" }].map((t) => (
              <button key={t.v} onClick={() => setFilterType(t.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", filterType === t.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>
                {t.l}
              </button>
            ))}
            {/* Filtro prioridad */}
            <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold ml-2">Prioridad:</span>
            {[{ v: "", l: "Todas" }, { v: "URGENT", l: "Urgente" }, { v: "HIGH", l: "Alta" }, { v: "NORMAL", l: "Normal" }, { v: "LOW", l: "Baja" }].map((p) => (
              <button key={p.v} onClick={() => setFilterPriority(p.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", filterPriority === p.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>
                {p.l}
              </button>
            ))}
          </div>
          {/* Toggle vista */}
          <div className="flex items-center p-0.5 rounded-lg border" style={{ background: "#0e0e13", borderColor: "rgba(255,255,255,0.08)" }}>
            <button onClick={() => setLocalView("board")} className={clsx("p-1.5 rounded", view === "board" ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#908fa0]")}>
              <Icon name="view_kanban" className="text-[16px]" />
            </button>
            <button onClick={() => setLocalView("list")} className={clsx("p-1.5 rounded", view === "list" ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#908fa0]")}>
              <Icon name="view_list" className="text-[16px]" />
            </button>
          </div>
        </div>
      </Card>

      {/* ── Contenido: Kanban o Tabla ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />)}
        </div>
      ) : view === "board" ? (

        /* ━━ KANBAN (3 columnas principales) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLS.map((col) => {
            const items = filtered.filter((i) => i.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-3 rounded-2xl p-4" style={{ background: "rgba(27,27,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Cabecera columna */}
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.dot }} />
                    <h2 className="text-[13px] font-semibold text-[#e4e1e9]">{col.label} ({items.length})</h2>
                  </div>
                  <span className="text-[11px] text-[#908fa0]">{col.subtitle}</span>
                </div>

                {/* Tarjetas */}
                <div className="flex flex-col gap-3">
                  {items.length === 0 ? (
                    <div className="p-6 rounded-xl text-center text-[12px] text-[#908fa0]" style={{ background: "rgba(14,14,19,0.4)", border: "1px dashed rgba(255,255,255,0.06)" }}>
                      Sin incidentes
                    </div>
                  ) : items.map((inc) => (
                    <IncidentCard
                      key={inc.id}
                      inc={inc}
                      colColor={col.color}
                      onOpenUnit={() => openUnit(inc.unitId)}
                      onChangeStatus={(status) => changeStatus(inc.id, status)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* ━━ VISTA TABLA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#908fa0] border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {["#", "Título", "Unidad", "Tipo", "Prioridad", "Estado", "Asignado", "Reportado"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => {
                  const st = incidentStatusStyle(inc.status);
                  const pr = priorityStyle(inc.priority);
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

      {/* ── Banner de emergencias ── */}
      <div className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147,0,10,0.30)" }}>
            <Icon name="emergency" className="text-[20px] text-[#ffb4ab]" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#e4e1e9]">¿Emergencia edilicia fuera de horario?</h4>
            <p className="text-[11px] text-[#908fa0]">Línea directa con intendencia y guardia de bomberos · Disponible 24hs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Tel: 0800-444-EDIFICIO · Guardia activa 24hs")}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#e4e1e9] flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-110"
            style={{ background: "#2a292f" }}
          >
            <Icon name="call" className="text-[15px] text-[#4cd7f6]" />
            Guardia Activa
          </button>
          <button
            onClick={() => toast.info("Protocolos de Seguridad y Plan de Evacuación del edificio")}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #571bc1, #8083ff)" }}
          >
            <Icon name="shield" className="text-[15px]" />
            Protocolos
          </button>
        </div>
      </div>

      {/* ── Modal nuevo incidente ── */}
      {showNew && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
          style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowNew(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl overflow-hidden animate-scale-in"
            style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <NewIncidentModal
              units={units}
              onClose={() => setShowNew(false)}
              onCreated={() => { load(); setShowNew(false); toast.success("Incidente reportado"); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tarjeta Kanban individual ─────────────────────────────────────────────────

function IncidentCard({
  inc, colColor, onOpenUnit, onChangeStatus,
}: {
  inc: Incident;
  colColor: string;
  onOpenUnit: () => void;
  onChangeStatus: (status: IncidentStatus) => void;
}) {
  const isUrgent = inc.priority === "URGENT";
  const accentColor = isUrgent ? "#f43f5e" : inc.priority === "HIGH" ? "#fbbf24" : colColor;

  const nextAction: { label: string; status: IncidentStatus; cls: string } | null =
    inc.status === "OPEN"
      ? { label: "Iniciar proceso", status: "IN_PROGRESS", cls: "bg-[#6366f1]/15 text-[#c0c1ff]" }
      : inc.status === "IN_PROGRESS"
      ? { label: "Marcar Resuelto", status: "RESOLVED", cls: "text-white" }
      : inc.status === "RESOLVED"
      ? { label: "Cerrar ticket", status: "CLOSED", cls: "bg-[#2a292f] text-[#c7c4d7]" }
      : null;

  return (
    <div
      className={clsx(
        "relative rounded-xl p-4 flex flex-col gap-2.5 shadow-md transition-all overflow-hidden cursor-pointer group",
        isUrgent
          ? "border-[#ffb4ab]/60"
          : "border-[rgba(255,255,255,0.06)] hover:border-[#8083ff]/40",
      )}
      style={{
        background: "#1f1f24",
        border: isUrgent ? "1px solid rgba(255,180,171,0.4)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isUrgent ? "0 0 15px -3px rgba(255,180,171,0.15)" : undefined,
      }}
      onClick={onOpenUnit}
    >
      {/* Borde de acento izquierdo */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ background: accentColor }} />

      {/* Header: ticket # + badges */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-bold" style={{ color: accentColor }}>#{inc.code}</span>
        <div className="flex items-center gap-1.5">
          <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full text-[#c7c4d7]" style={{ background: "#35343a" }}>
            {inc.type === "MAINTENANCE" ? "Mant." : inc.type === "INCIDENT" ? "Inc." : "Recl."}
          </span>
          <span
            className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", isUrgent ? "animate-pulse" : "")}
            style={isUrgent
              ? { background: "rgba(147,0,10,0.60)", color: "#ffdad6" }
              : { background: "rgba(87,27,193,0.30)", color: "#d0bcff" }
            }
          >
            {inc.priority}
          </span>
        </div>
      </div>

      {/* Imagen adjunta (si disponible) */}
      {inc.imageUrl && (
        <div className="h-28 w-full rounded-lg overflow-hidden" style={{ background: "#131318" }}>
          <img src={inc.imageUrl} alt={inc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
      )}

      {/* Título y descripción */}
      <div>
        <h3 className="text-[12px] font-bold text-[#e4e1e9] leading-snug">{inc.title}</h3>
        <p className="text-[11px] text-[#c7c4d7] mt-1 leading-relaxed line-clamp-2">{inc.description}</p>
      </div>

      {/* SLA countdown (solo en OPEN / IN_PROGRESS con SLA disponible) */}
      {inc.slaRemaining && ["OPEN", "IN_PROGRESS"].includes(inc.status) && (
        <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded w-fit" style={{ background: "rgba(147,0,10,0.20)", color: "#ffb4ab" }}>
          <Icon name="timer" className="text-[12px]" />
          <span>{inc.slaRemaining}</span>
        </div>
      )}

      {/* Barra de progreso en In_Progress */}
      {inc.status === "IN_PROGRESS" && inc.progressPercent !== undefined && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-[#908fa0]">
            <span>Progreso de reparación</span>
            <span className="font-mono text-[#4cd7f6]">{inc.progressPercent}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ background: "#131318", height: "5px" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${inc.progressPercent}%`, background: "linear-gradient(90deg, #4cd7f6, #6366f1)" }} />
          </div>
        </div>
      )}

      {/* Técnico asignado */}
      {inc.assignedTo && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#c0c1ff] px-2 py-1 rounded-lg" style={{ background: "#131318" }}>
          <Icon name="engineering" className="text-[14px]" />
          <span>{inc.assignedTo}</span>
        </div>
      )}

      {/* Footer: reportado por / cuando */}
      <div className="pt-2 flex items-center justify-between text-[10px] text-[#908fa0]" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span>{inc.reportedBy ?? `Unidad ${inc.unit?.code ?? "—"}`}</span>
        <span>{relativeTime(inc.createdAt)}</span>
      </div>

      {/* Botón de acción siguiente */}
      {nextAction && (
        <button
          onClick={(e) => { e.stopPropagation(); onChangeStatus(nextAction.status); }}
          className={clsx("w-full py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-110", nextAction.cls)}
          style={nextAction.status === "RESOLVED" ? { background: "linear-gradient(135deg, #571bc1, #8083ff)" } : undefined}
        >
          {nextAction.label}
          <Icon name="arrow_forward" className="text-[13px]" />
        </button>
      )}
    </div>
  );
}

// ── Modal nuevo incidente ─────────────────────────────────────────────────────

function NewIncidentModal({ units, onClose, onCreated }: { units: Unit[]; onClose: () => void; onCreated: () => void }) {
  const [unitId, setUnitId] = useState("");
  const [type, setType] = useState("MAINTENANCE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!unitId || !title) { toast.error("Completa unidad y título"); return; }
    setSaving(true);
    try {
      await api.createIncident({ unitId, type, title, description, priority });
      onCreated();
    } catch { toast.error("No se pudo crear"); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md" style={{ background: "rgba(251,191,36,0.15)" }}>
            <Icon name="add_alert" className="text-[18px] text-[#fbbf24]" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#e4e1e9]">Reportar Nuevo Incidente</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]">
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Unidad</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <option value="">Seleccionar...</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.label} — {u.tower}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="INCIDENT">Incidente</option>
              <option value="COMPLAINT">Reclamo</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Título del desperfecto</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Pérdida de agua bajo lavatorio" required className="bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Descripción detallada</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detalla ubicación exacta, síntomas y posible riesgo..." className="bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1] resize-none" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Nivel de Prioridad</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { v: "LOW", l: "Baja (SLA 72h)", c: "#94a3b8" },
              { v: "NORMAL", l: "Normal (SLA 24h)", c: "#06b6d4" },
              { v: "HIGH", l: "Alta (SLA 4h)", c: "#fbbf24" },
              { v: "URGENT", l: "Urgente (SLA 1h)", c: "#f43f5e" },
            ].map((p) => (
              <button key={p.v} onClick={() => setPriority(p.v)} className={clsx("px-3 py-1.5 rounded text-[11px] font-semibold border transition-all flex items-center gap-1.5", priority === p.v ? "text-white" : "bg-[#1b1b20] text-[#c7c4d7]")} style={priority === p.v ? { background: p.c, borderColor: p.c } : { borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.c }} />
                {p.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn variant="primary" icon="check" onClick={submit} disabled={saving}>
          {saving ? "Creando..." : "Emitir Ticket SLA"}
        </Btn>
      </div>
    </>
  );
}
