// src/features/reservas/components/ReservasView.tsx — adaptado de modelo1
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { AmenitySpace, Reservation, Unit } from "@/lib/types";
import { Card, SectionHeader, Btn, EmptyState } from "@/lib/primitives";
import { Icon, reservationStatusStyle, StatusBadge } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

function spaceIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("parrilla")) return "outdoor_grill";
  if (n.includes("sum")) return "groups";
  if (n.includes("gimnasio")) return "fitness_center";
  if (n.includes("paddle")) return "sports_tennis";
  if (n.includes("coworking")) return "co_present";
  return "event";
}

export function ReservasView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit, role, residentUnitId } = useApp();
  const [spaces, setSpaces] = useState<AmenitySpace[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [showNew, setShowNew] = useState(false);
  const isResident = role === "RESIDENT";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.spaces(selectedBuildingId ?? undefined),
      api.reservations({ unitId: isResident ? (residentUnitId ?? undefined) : undefined }),
      api.units({ buildingId: selectedBuildingId ?? undefined }),
    ]).then(([s, r, u]) => {
      setSpaces(s); setReservations(r); setUnits(u);
      if (s.length > 0 && !selectedSpace) setSelectedSpace(s[0].id);
    }).finally(() => setLoading(false));
  }, [selectedBuildingId]);

  const spaceReservations = reservations.filter((r) => !selectedSpace || r.spaceId === selectedSpace);
  const upcoming = spaceReservations.filter((r) => new Date(r.date) >= new Date() && r.status === "CONFIRMED").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = spaceReservations.filter((r) => new Date(r.date) < new Date() || r.status !== "CONFIRMED").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const openUnit = (uid: string) => { setSelectedUnit(uid); navigate("/vista360"); };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(139,92,246,0.12)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[#d0bcff] font-mono text-[11px]" style={{ background: "#2a292f" }}>RESERVAS</span>
              {isResident && <span className="px-2 py-0.5 rounded text-[#d0bcff] font-mono text-[11px] flex items-center gap-1" style={{ background: "rgba(208,188,255,0.12)" }}><Icon name="person" className="text-[12px]" />Mis reservas</span>}
            </div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Reservas de Espacios</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">{isResident ? "Consulta y gestiona tus reservas de amenities." : "Gestión de disponibilidad y reservas de amenities: parrillas, SUM, gimnasio, paddle y coworking."}</p>
          </div>
          <Btn variant="primary" icon="add_circle" onClick={() => setShowNew(true)}>Nueva Reserva</Btn>
        </div>
      </div>

      {/* Space selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {spaces.map((sp) => {
          const count = reservations.filter((r) => r.spaceId === sp.id && r.status === "CONFIRMED" && new Date(r.date) >= new Date()).length;
          const active = selectedSpace === sp.id;
          return (
            <button key={sp.id} onClick={() => setSelectedSpace(active ? "" : sp.id)} className={clsx("p-4 rounded-xl text-left transition-all border", active ? "bg-[#6366f1]/10 border-[#6366f1]/40" : "border-[rgba(255,255,255,0.06)] hover:bg-[#1f1f24]")} style={!active ? { background: "#1a1a24" } : undefined}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-md" style={{ background: active ? "rgba(99,102,241,0.20)" : "rgba(139,92,246,0.12)" }}><Icon name={spaceIcon(sp.name)} className={clsx("text-[18px]", active ? "text-[#c0c1ff]" : "text-[#d0bcff]")} /></div>
                <span className="text-[10px] font-mono text-[#908fa0]">{count} activas</span>
              </div>
              <div className="text-[14px] font-semibold text-[#e4e1e9] truncate">{sp.name}</div>
              <div className="text-[11px] text-[#908fa0] font-mono">{sp.location} · cap. {sp.capacity}</div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card><div className="py-8 flex justify-center"><Icon name="progress_activity" className="animate-spin text-[24px] text-[#908fa0]" /></div></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <SectionHeader icon="event_upcoming" iconColor="#34d399" iconBg="rgba(52,211,153,0.15)" title="Próximas reservas" subtitle={selectedSpace ? spaces.find((s) => s.id === selectedSpace)?.name : "Todos los espacios"} />
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(52,211,153,0.08)" }}><Icon name="event_available" className="text-[32px] text-[#34d399]/60" /></div>
                <p className="text-[14px] font-medium text-[#c7c4d7]">Sin reservas próximas</p>
                <p className="text-[12px] text-[#908fa0] mt-1 mb-4 max-w-xs">No hay reservas confirmadas a futuro.</p>
                <Btn variant="primary" icon="add_circle" onClick={() => setShowNew(true)}>Crear reserva</Btn>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.slice(0, 8).map((r) => (
                  <ReservationRow key={r.id} r={r} onOpen={openUnit} onCancel={async () => { await api.patchReservation(r.id, "CANCELLED"); setReservations(await api.reservations()); toast.success("Reserva cancelada"); }} />
                ))}
              </div>
            )}
          </Card>
          <Card>
            <SectionHeader icon="history" iconColor="#908fa0" title="Historial" subtitle="Reservas pasadas" />
            {past.length === 0 ? <EmptyState icon="event_busy" title="Sin historial" /> : (
              <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto">
                {past.slice(0, 15).map((r) => <ReservationRow key={r.id} r={r} compact onOpen={openUnit} />)}
              </div>
            )}
          </Card>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in" style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }} onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden animate-scale-in" style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
            <NewReservationModal spaces={spaces} units={units} defaultSpaceId={selectedSpace} onClose={() => setShowNew(false)} onCreated={async () => { setReservations(await api.reservations()); setShowNew(false); toast.success("Reserva creada"); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ReservationRow({ r, compact, onOpen, onCancel }: { r: Reservation; compact?: boolean; onOpen: (uid: string) => void; onCancel?: () => Promise<void> }) {
  const st = reservationStatusStyle(r.status);
  const isUpcoming = new Date(r.date) >= new Date() && r.status === "CONFIRMED";
  return (
    <div className="relative overflow-hidden p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-[#1f1f24] transition-colors" style={{ background: "#1b1b20" }}>
      {isUpcoming && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#571bc1]" />}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
          <span className="text-[16px] font-bold text-[#d0bcff] tnum leading-none">{new Date(r.date).getDate()}</span>
          <span className="text-[10px] uppercase text-[#908fa0]">{new Date(r.date).toLocaleDateString("es-AR", { month: "short" })}</span>
        </div>
        <div className="w-[1px] h-8 bg-[#464554]/40 flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-semibold text-[#e4e1e9] truncate">{r.space?.name ?? "Espacio"}</span>
          <span className="text-[11px] font-mono text-[#908fa0] truncate">{r.startHour}–{r.endHour} · {r.attendees}p{r.purpose ? ` · ${r.purpose}` : ""}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => onOpen(r.unitId)} className="text-[11px] font-mono text-[#c7c4d7] hover:text-[#c0c1ff] flex items-center gap-1"><Icon name="apartment" className="text-[12px]" />{r.unit?.label ?? "—"}</button>
        <StatusBadge style={st} />
        {!compact && isUpcoming && onCancel && <Btn size="sm" variant="danger" icon="close" onClick={onCancel}>Cancelar</Btn>}
      </div>
    </div>
  );
}

function NewReservationModal({ spaces, units, defaultSpaceId, onClose, onCreated }: { spaces: AmenitySpace[]; units: Unit[]; defaultSpaceId: string; onClose: () => void; onCreated: () => Promise<void> }) {
  const [spaceId, setSpaceId] = useState(defaultSpaceId || spaces[0]?.id || "");
  const [unitId, setUnitId] = useState(""); const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [startHour, setStartHour] = useState("19:00"); const [endHour, setEndHour] = useState("23:00"); const [purpose, setPurpose] = useState(""); const [attendees, setAttendees] = useState(2); const [saving, setSaving] = useState(false);
  const space = spaces.find((s) => s.id === spaceId);
  const submit = async () => {
    if (!spaceId || !unitId || !date) { toast.error("Completa todos los campos"); return; }
    setSaving(true);
    try { await api.createReservation({ unitId, spaceId, date: new Date(date).toISOString(), startHour, endHour, purpose, attendees }); await onCreated(); }
    catch (e: any) { toast.error(e.message || "No se pudo crear"); } finally { setSaving(false); }
  };
  const inp = "bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]";
  const brd = { borderColor: "rgba(255,255,255,0.08)" };
  const lbl = "text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold";
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-[#6366f1]/15"><Icon name="add_circle" className="text-[18px] text-[#c0c1ff]" /></div><h3 className="text-[16px] font-semibold text-[#e4e1e9]">Nueva reserva de espacio</h3></div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]"><Icon name="close" className="text-[18px]" /></button>
      </div>
      <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5"><label className={lbl}>Espacio</label><select value={spaceId} onChange={(e) => setSpaceId(e.target.value)} className={inp} style={brd}>{spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Unidad</label><select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={inp} style={brd}><option value="">Seleccionar...</option>{units.map((u) => <option key={u.id} value={u.id}>{u.label} — {u.tower}</option>)}</select></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Fecha</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} style={brd} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Asistentes</label><input type="number" min={1} max={space?.capacity ?? 50} value={attendees} onChange={(e) => setAttendees(Number(e.target.value))} className={inp} style={brd} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Desde</label><input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className={inp} style={brd} /></div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Hasta</label><input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} className={inp} style={brd} /></div>
        </div>
        <div className="flex flex-col gap-1.5"><label className={lbl}>Motivo (opcional)</label><input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Ej: Cumpleaños familiar" className={inp} style={brd} /></div>
        {space && <div className="flex items-center gap-2 text-[11px] font-mono text-[#908fa0] px-3 py-2 rounded-lg" style={{ background: "#1b1b20" }}><Icon name="info" className="text-[14px] text-[#4cd7f6]" />{space.name} · Cap. {space.capacity} · {space.openFrom}–{space.openTo}</div>}
      </div>
      <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn variant="primary" icon="check" onClick={submit} disabled={saving}>{saving ? "Creando..." : "Crear reserva"}</Btn>
      </div>
    </>
  );
}
