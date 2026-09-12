// src/features/mudanzas/components/MudanzasView.tsx — adaptado de modelo1
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { MoveRequest, Unit } from "@/lib/types";
import { Card, SectionHeader, Btn, EmptyState, KpiCard } from "@/lib/primitives";
import { Icon, moveStatusStyle, StatusBadge } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

export function MudanzasView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit } = useApp();
  const [moves, setMoves] = useState<MoveRequest[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.moves(), api.units({ buildingId: selectedBuildingId ?? undefined })])
      .then(([m, u]) => { setMoves(m); setUnits(u); }).finally(() => setLoading(false));
  };
  useEffect(load, [selectedBuildingId]);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = moves.filter((m) => {
    if (filter && m.status !== filter) return false;
    if (search) { const nq = norm(search); return norm(m.unit?.label ?? "").includes(nq) || norm(m.company ?? "").includes(nq); }
    return true;
  });
  const upcoming = filtered.filter((m) => new Date(m.date) >= new Date() && ["PENDING", "APPROVED"].includes(m.status)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = filtered.filter((m) => !upcoming.includes(m)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const stats = { total: moves.length, pending: moves.filter((m) => m.status === "PENDING").length, approved: moves.filter((m) => m.status === "APPROVED" && new Date(m.date) >= new Date()).length, completed: moves.filter((m) => m.status === "COMPLETED").length };
  const openUnit = (uid: string) => { setSelectedUnit(uid); navigate("/vista360"); };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(251,191,36,0.10)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#fbbf24] font-mono text-[11px]" style={{ background: "#2a292f" }}>LOGÍSTICA</span></div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Gestión de Mudanzas</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">Solicitudes de ingreso y egreso, programación de ascensor de servicio y autorización de empresas.</p>
          </div>
          <Btn variant="primary" icon="add" onClick={() => setShowNew(true)}>Nueva solicitud</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Solicitudes" value={stats.total} icon="moving" iconColor="#fbbf24" iconBg="rgba(251,191,36,0.12)" sub="Histórico completo" />
        <KpiCard label="Pendientes" value={stats.pending} icon="pending" iconColor="#fbbf24" iconBg="rgba(251,191,36,0.12)" sub="Esperando aprobación" />
        <KpiCard label="Aprobadas" value={stats.approved} icon="event_available" iconColor="#06b6d4" iconBg="rgba(6,182,212,0.12)" sub="Próximas a realizarse" />
        <KpiCard label="Completadas" value={stats.completed} icon="check_circle" iconColor="#34d399" iconBg="rgba(52,211,153,0.12)" sub="Finalizadas" />
      </div>

      <Card>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#908fa0]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar mudanza..." className="w-36 bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[12px] pl-7 pr-2 py-1.5 rounded-md border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
          <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Estado:</span>
          {[{ v: "", l: "Todas" }, { v: "PENDING", l: "Pendientes" }, { v: "APPROVED", l: "Aprobadas" }, { v: "COMPLETED", l: "Completadas" }, { v: "CANCELLED", l: "Canceladas" }].map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", filter === f.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{f.l}</button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader icon="event_upcoming" iconColor="#06b6d4" iconBg="rgba(6,182,212,0.15)" title="Mudanzas próximas" subtitle={`${upcoming.length} programadas`} />
        {loading ? <div className="py-6 flex justify-center"><Icon name="progress_activity" className="animate-spin text-[24px] text-[#908fa0]" /></div> : upcoming.length === 0 ? (
          <EmptyState icon="event_available" title="Sin mudanzas próximas" sub="No hay solicitudes aprobadas o pendientes a futuro." />
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((m) => (
              <MoveRow key={m.id} m={m} onOpen={() => openUnit(m.unitId)}
                onApprove={async () => { await api.patchMove(m.id, "APPROVED"); load(); toast.success("Mudanza aprobada"); }}
                onComplete={async () => { await api.patchMove(m.id, "COMPLETED"); load(); toast.success("Mudanza completada"); }}
              />
            ))}
          </div>
        )}
      </Card>

      {past.length > 0 && (
        <Card>
          <SectionHeader icon="history" iconColor="#908fa0" title="Historial" subtitle={`${past.length} registros`} />
          <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto">
            {past.slice(0, 20).map((m) => <MoveRow key={m.id} m={m} compact onOpen={() => openUnit(m.unitId)} />)}
          </div>
        </Card>
      )}

      {showNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in" style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }} onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden animate-scale-in" style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
            <NewMoveModal units={units} onClose={() => setShowNew(false)} onCreated={() => { load(); setShowNew(false); toast.success("Solicitud creada"); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MoveRow({ m, compact, onOpen, onApprove, onComplete }: { m: MoveRequest; compact?: boolean; onOpen: () => void; onApprove?: () => Promise<void>; onComplete?: () => Promise<void> }) {
  const st = moveStatusStyle(m.status);
  const isIn = m.type === "MOVE_IN";
  const isUpcoming = new Date(m.date) >= new Date() && !["CANCELLED", "COMPLETED"].includes(m.status);
  return (
    <div className="relative overflow-hidden rounded-lg p-4 flex items-center justify-between gap-3 hover:bg-[#1f1f24] transition-all" style={{ background: "#1b1b20" }}>
      {isUpcoming && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: isIn ? "#06b6d4" : "#8b5cf6" }} />}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center w-14 flex-shrink-0">
          <span className="text-[18px] font-bold tnum leading-none" style={{ color: isIn ? "#06b6d4" : "#8b5cf6" }}>{new Date(m.date).getDate()}</span>
          <span className="text-[10px] uppercase text-[#908fa0]">{new Date(m.date).toLocaleDateString("es-AR", { month: "short" })}</span>
        </div>
        <div className="w-[1px] h-10 bg-[#464554]/40 flex-shrink-0" />
        <div className="p-2 rounded-lg flex-shrink-0" style={{ background: isIn ? "rgba(6,182,212,0.12)" : "rgba(139,92,246,0.12)" }}>
          <Icon name={isIn ? "login" : "logout"} className="text-[18px]" style={{ color: isIn ? "#06b6d4" : "#8b5cf6" }} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#e4e1e9]">{isIn ? "Ingreso" : "Egreso"}</span>
            <button onClick={onOpen} className="text-[12px] font-mono text-[#c7c4d7] hover:text-[#c0c1ff] flex items-center gap-1"><Icon name="apartment" className="text-[12px]" />{m.unit?.label ?? "—"} · {m.unit?.tower ?? ""}</button>
          </div>
          <span className="text-[11px] font-mono text-[#908fa0] truncate">{m.startHour}–{m.endHour}{m.company ? ` · ${m.company}` : ""}{m.notes ? ` · ${m.notes}` : ""}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge style={st} />
        {!compact && m.status === "PENDING" && onApprove && <Btn size="sm" variant="primary" icon="check" onClick={onApprove}>Aprobar</Btn>}
        {!compact && m.status === "APPROVED" && onComplete && <Btn size="sm" variant="ghost" icon="task_alt" onClick={onComplete}>Completar</Btn>}
      </div>
    </div>
  );
}

function NewMoveModal({ units, onClose, onCreated }: { units: Unit[]; onClose: () => void; onCreated: () => void }) {
  const [unitId, setUnitId] = useState(""); const [type, setType] = useState<"MOVE_IN" | "MOVE_OUT">("MOVE_IN");
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
  const [startHour, setStartHour] = useState("09:00"); const [endHour, setEndHour] = useState("13:00"); const [company, setCompany] = useState(""); const [notes, setNotes] = useState(""); const [saving, setSaving] = useState(false);
  const inp = "bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1] w-full";
  const brd = { borderColor: "rgba(255,255,255,0.08)" };
  const lbl = "text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold";
  const submit = async () => {
    if (!unitId || !date) { toast.error("Completa todos los campos"); return; }
    setSaving(true);
    try { await api.createMove({ unitId, date: new Date(date).toISOString(), startHour, endHour, type, company: company || undefined, notes: notes || undefined }); onCreated(); }
    catch { toast.error("No se pudo crear"); } finally { setSaving(false); }
  };
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-[#fbbf24]/15"><Icon name="moving" className="text-[18px] text-[#fbbf24]" /></div><h3 className="text-[16px] font-semibold text-[#e4e1e9]">Nueva solicitud de mudanza</h3></div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]"><Icon name="close" className="text-[18px]" /></button>
      </div>
      <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div className="flex flex-col gap-1.5"><label className={lbl}>Tipo de operación</label>
          <div className="flex items-center gap-2">
            {([{ v: "MOVE_IN", l: "Ingreso", color: "#06b6d4" }, { v: "MOVE_OUT", l: "Egreso", color: "#8b5cf6" }] as const).map((t) => (
              <button key={t.v} onClick={() => setType(t.v)} className={clsx("flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[13px] font-medium transition-all", type === t.v ? "text-white" : "bg-[#1b1b20] text-[#c7c4d7]")} style={type === t.v ? { background: t.color, borderColor: t.color } : { borderColor: "rgba(255,255,255,0.08)" }}>
                <Icon name={t.v === "MOVE_IN" ? "login" : "logout"} className="text-[16px]" />{t.l}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5"><label className={lbl}>Unidad</label><select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={inp} style={brd}><option value="">Seleccionar...</option>{units.map((u) => <option key={u.id} value={u.id}>{u.label} — {u.tower} — Piso {u.floor}</option>)}</select></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Fecha</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} style={brd} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Empresa mudanza</label><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Opcional" className={inp} style={brd} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Desde</label><input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className={inp} style={brd} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Hasta</label><input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} className={inp} style={brd} /></div>
          <div className="col-span-2 flex flex-col gap-1.5"><label className={lbl}>Notas</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observaciones adicionales..." className={inp + " resize-none"} style={brd} /></div>
        </div>
      </div>
      <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn variant="primary" icon="check" onClick={submit} disabled={saving}>{saving ? "Creando..." : "Crear solicitud"}</Btn>
      </div>
    </>
  );
}
