// src/features/reservas/components/ReservasView.tsx
// Diseño fusionado: calendario semanal interactivo de modelo2 + lógica API del proyecto actual

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { AmenitySpace, Reservation, Unit } from "@/lib/types";
import { Btn, EmptyState } from "@/lib/primitives";
import { Icon, reservationStatusStyle, StatusBadge, relativeTime } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────

function spaceIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("parrilla")) return "outdoor_grill";
  if (n.includes("sum")) return "groups";
  if (n.includes("gimnasio")) return "fitness_center";
  if (n.includes("paddle")) return "sports_tennis";
  if (n.includes("coworking")) return "co_present";
  return "event";
}

/** Genera los 7 días de la semana actual a partir del lunes */
function getWeekDays() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
    return {
      date: d,
      name: dayNames[i],
      dayNum: d.getDate(),
      monthStr: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      isToday: d.toDateString() === now.toDateString(),
    };
  });
}

const TIME_SLOTS = [
  { label: "09:00", hour: 9 },
  { label: "12:00", hour: 12 },
  { label: "15:00", hour: 15 },
  { label: "18:00", hour: 18 },
  { label: "21:00", hour: 21 },
];

// ── Componente principal ──────────────────────────────────────────────────────

export function ReservasView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit, role, residentUnitId } = useApp();
  const [spaces, setSpaces] = useState<AmenitySpace[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [preDate, setPreDate] = useState("");
  const [preHour, setPreHour] = useState(19);
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const isResident = role === "RESIDENT";
  const weekDays = useMemo(() => getWeekDays(), []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.spaces(selectedBuildingId ?? undefined),
      api.reservations({ unitId: isResident ? (residentUnitId ?? undefined) : undefined }),
      api.units({ buildingId: selectedBuildingId ?? undefined }),
    ])
      .then(([s, r, u]) => {
        setSpaces(s);
        setReservations(r);
        setUnits(u);
        if (s.length > 0 && !selectedSpaceId) setSelectedSpaceId(s[0].id);
      })
      .finally(() => setLoading(false));
  }, [selectedBuildingId]);

  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId) ?? spaces[0];
  const spaceReservations = reservations.filter((r) => !selectedSpaceId || r.spaceId === selectedSpaceId);
  const upcoming = spaceReservations
    .filter((r) => new Date(r.date) >= new Date() && r.status === "CONFIRMED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openUnit = (uid: string) => { setSelectedUnit(uid); navigate("/vista360"); };

  const handleCellClick = (date: string, hour: number) => {
    setPreDate(date);
    setPreHour(hour);
    setShowNew(true);
  };

  /** Encuentra si hay una reserva activa para este día y franja horaria */
  const findReservation = (date: Date, slotHour: number) =>
    spaceReservations.find((r) => {
      const rDate = new Date(r.date);
      const rStartH = parseInt(r.startHour.split(":")[0], 10);
      const rEndH = parseInt(r.endHour.split(":")[0], 10);
      return (
        rDate.toDateString() === date.toDateString() &&
        slotHour >= rStartH &&
        slotHour < (rEndH === 0 ? 24 : rEndH)
      );
    });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(139,92,246,0.12)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[#d0bcff] font-mono text-[11px]" style={{ background: "#2a292f" }}>AMENITIES</span>
              <span className="text-[11px] font-semibold text-[#d0bcff] uppercase tracking-wider">
                {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
              </span>
              {isResident && (
                <span className="px-2 py-0.5 rounded text-[#d0bcff] font-mono text-[11px] flex items-center gap-1" style={{ background: "rgba(208,188,255,0.12)" }}>
                  <Icon name="person" className="text-[12px]" />Mis reservas
                </span>
              )}
            </div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Reservas de Espacios Comunes</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl mt-1">
              {isResident ? "Consulta y gestiona tus reservas de amenities." : "Gestión de disponibilidad y reservas de amenities: parrillas, SUM, gimnasio, paddle y coworking."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg border" style={{ background: "#0e0e13", borderColor: "rgba(255,255,255,0.08)" }}>
              <button onClick={() => setActiveTab("calendar")} className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-all", activeTab === "calendar" ? "bg-[#6366f1]/20 text-[#c0c1ff]" : "text-[#908fa0] hover:text-[#e4e1e9]")}>
                <Icon name="calendar_view_week" className="text-[15px]" />Calendario
              </button>
              <button onClick={() => setActiveTab("list")} className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-all", activeTab === "list" ? "bg-[#6366f1]/20 text-[#c0c1ff]" : "text-[#908fa0] hover:text-[#e4e1e9]")}>
                <Icon name="view_list" className="text-[15px]" />Lista
              </button>
            </div>
            <Btn variant="primary" icon="add_circle" onClick={() => { setPreDate(""); setShowNew(true); }}>
              Nueva Reserva
            </Btn>
          </div>
        </div>
      </div>

      {/* ── Selector de espacios (tarjetas) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />
            ))
          : spaces.map((sp) => {
              const isActive = sp.id === selectedSpaceId;
              const confirmedCount = reservations.filter((r) => r.spaceId === sp.id && r.status === "CONFIRMED" && new Date(r.date) >= new Date()).length;
              return (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSpaceId(isActive ? "" : sp.id)}
                  className={clsx(
                    "rounded-xl border p-4 text-left transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer",
                    isActive
                      ? "bg-[#1f1f24] border-[#8083ff] shadow-[0_0_20px_-4px_rgba(128,131,255,0.3)]"
                      : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]",
                  )}
                  style={!isActive ? { background: "#1b1b20" } : undefined}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {sp.emoji
                          ? <span className="text-lg">{sp.emoji}</span>
                          : <div className="p-1 rounded-md" style={{ background: "rgba(99,102,241,0.15)" }}><Icon name={spaceIcon(sp.name)} className="text-[15px] text-[#c0c1ff]" /></div>
                        }
                        <span className="text-[13px] font-semibold text-[#e4e1e9] truncate group-hover:text-[#c0c1ff] transition-colors">{sp.name}</span>
                      </div>
                      <p className="text-[11px] text-[#908fa0] mt-0.5 truncate">{sp.subtitle ?? sp.location}</p>
                    </div>
                    <span className={clsx("px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0", sp.isAvailableToday !== false ? "bg-[#009eb9]/20 text-[#4cd7f6]" : "bg-[#571bc1]/20 text-[#d0bcff]")}>
                      {sp.todayStatus ?? (sp.isAvailableToday !== false ? "Libre" : "Ocupado")}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between text-[11px] text-[#908fa0]">
                    <span className="flex items-center gap-1"><Icon name="group" className="text-[13px]" />Cap. {sp.capacity}</span>
                    <span className="font-mono text-[#c7c4d7]">{confirmedCount} activas</span>
                  </div>
                </button>
              );
            })
        }
      </div>

      {/* ── Contenido principal: Calendario o Lista ── */}
      {loading ? (
        <div className="h-64 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />
      ) : activeTab === "calendar" ? (

        /* ━━ VISTA CALENDARIO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Calendario semanal (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl p-5 flex flex-col" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="calendar_view_week" className="text-[#8083ff] text-[20px]" />
                <h2 className="text-[14px] font-semibold text-[#e4e1e9]">
                  Cronograma Semanal{selectedSpace ? `: ${selectedSpace.name}` : ""}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#908fa0]">
                <span>{weekDays[0].monthStr} – {weekDays[6].monthStr}</span>
                <span className="px-1.5 py-0.5 rounded font-mono text-[11px] text-[#c0c1ff]" style={{ background: "#2a292f" }}>
                  Hoy: {weekDays.find((d) => d.isToday)?.name} {weekDays.find((d) => d.isToday)?.dayNum}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                {/* Cabecera de días */}
                <div className="grid gap-1.5 pb-2 border-b text-center text-[11px] font-semibold" style={{ gridTemplateColumns: "3rem repeat(7, 1fr)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-[#908fa0] text-left pl-1">Hora</div>
                  {weekDays.map((day) => (
                    <div key={day.name} className={clsx("py-1.5 rounded-lg", day.isToday ? "bg-[#571bc1]/30 text-[#d0bcff] ring-1 ring-[#8083ff]" : "text-[#c7c4d7]")}>
                      <div>{day.name}</div>
                      <div className="text-[10px] text-[#908fa0] font-mono">{day.monthStr}</div>
                    </div>
                  ))}
                </div>

                {/* Filas de horario */}
                <div className="flex flex-col divide-y" style={{ divideBorderColor: "rgba(255,255,255,0.04)" }}>
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot.label} className="grid gap-1.5 py-2 items-stretch min-h-[52px]" style={{ gridTemplateColumns: "3rem repeat(7, 1fr)" }}>
                      {/* Etiqueta hora */}
                      <div className="text-[11px] font-mono text-[#908fa0] flex items-center pl-1">{slot.label}</div>

                      {/* Celdas de días */}
                      {weekDays.map((day) => {
                        const booking = findReservation(day.date, slot.hour);
                        const isMaintenanceSlot = day.name === "LUN" && slot.hour === 9;

                        if (isMaintenanceSlot && !booking) {
                          return (
                            <div key={day.name} className="rounded-lg p-1.5 text-[10px] text-[#908fa0] flex flex-col justify-center items-center text-center border border-dashed" style={{ background: "rgba(42,41,47,0.6)", borderColor: "rgba(70,69,84,0.4)" }}>
                              <span>Mant.</span>
                            </div>
                          );
                        }

                        if (booking) {
                          const isToday = day.isToday;
                          return (
                            <button
                              key={day.name}
                              onClick={() => openUnit(booking.unitId)}
                              className={clsx(
                                "rounded-lg p-1.5 text-left flex flex-col justify-between cursor-pointer transition-all shadow-sm text-[10px]",
                                isToday ? "text-white" : "text-[#c0c1ff] hover:brightness-110",
                              )}
                              style={isToday ? { background: "#571bc1", boxShadow: "0 0 12px -2px rgba(87,27,193,0.5)" } : { background: "#2a292f" }}
                              title={`Depto ${booking.unit?.label ?? "—"} · ${booking.purpose ?? "Reservado"}`}
                            >
                              <div className="font-bold truncate">{booking.unit?.code ?? "—"}</div>
                              <div className="text-[9px] opacity-75 font-mono">{booking.startHour}</div>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={day.name}
                            onClick={() => handleCellClick(day.date.toISOString().slice(0, 10), slot.hour)}
                            className="rounded-lg flex items-center justify-center cursor-pointer group transition-all border border-transparent hover:border-[#8083ff]/40"
                            style={{ background: "rgba(14,14,19,0.4)" }}
                            title="Click para reservar"
                          >
                            <Icon name="add" className="text-[14px] text-transparent group-hover:text-[#8083ff] transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-[#908fa0]" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <span>Haz click en una celda libre para agendar una reserva</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#571bc1" }} />
                  <span>Activo hoy</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#2a292f" }} />
                  <span>Agendado</span>
                </span>
              </div>
            </div>
          </div>

          {/* Panel lateral: info del espacio seleccionado */}
          <div className="lg:col-span-4 rounded-2xl overflow-hidden flex flex-col" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
            {selectedSpace ? (
              <>
                {/* Banner visual con gradiente + emoji */}
                <div className="relative h-36 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1f1f2e 0%, #0e0e13 100%)" }}>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(87,27,193,0.25) 0%, rgba(128,131,255,0.15) 100%)" }} />
                  <div className="relative flex flex-col items-center gap-2 text-center px-4">
                    <span className="text-5xl" role="img" aria-label={selectedSpace.name}>{selectedSpace.emoji ?? "🏠"}</span>
                    <div>
                      <h3 className="text-[15px] font-bold text-white drop-shadow-sm">{selectedSpace.name}</h3>
                      <span className="text-[11px] text-[#c7c4d7]">{selectedSpace.location}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#c0c1ff]" style={{ background: "rgba(14,14,19,0.8)", backdropFilter: "blur(4px)" }}>
                      {selectedSpace.capacity} pax máx.
                    </span>
                  </div>
                </div>

                {/* Detalles y normativa */}
                <div className="p-4 flex flex-col gap-3 text-[12px] flex-1">
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Horarios permitidos:", value: selectedSpace.allowedHours ?? `${selectedSpace.openFrom}–${selectedSpace.openTo}` },
                      { label: "Tasa de limpieza:", value: selectedSpace.cleaningFee ?? (selectedSpace.hourlyRate > 0 ? `$${selectedSpace.hourlyRate}/h` : "Sin cargo") },
                      { label: "Depósito en garantía:", value: selectedSpace.depositFee ?? "—", accent: true },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-[#908fa0]">{label}</span>
                        <span className={clsx("font-semibold font-mono", accent ? "text-[#4cd7f6]" : "text-[#e4e1e9]")}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl text-[11px] leading-relaxed text-[#c7c4d7]" style={{ background: "#131318" }}>
                    <strong className="text-[#e4e1e9]">Normativa:</strong>{" "}
                    Se requiere confirmación en portería con al menos 24 horas de antelación. Música permitida a volumen moderado hasta las 00:00.
                  </div>

                  <div className="mt-auto pt-2 flex flex-col gap-2">
                    <Btn variant="primary" icon="event_available" onClick={() => { setPreDate(""); setShowNew(true); }}>
                      Reservar {selectedSpace.name}
                    </Btn>
                    <button
                      onClick={() => toast.info("Función disponible con backend conectado")}
                      className="w-full py-1.5 rounded-lg text-[11px] font-medium text-[#c7c4d7] hover:text-[#e4e1e9] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={{ background: "#2a292f" }}
                    >
                      <Icon name="download" className="text-[14px]" />
                      Descargar Reglamento (PDF)
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState icon="event" title="Seleccioná un espacio" subtitle="Hacé click en una de las tarjetas para ver su disponibilidad y normativa." />
            )}
          </div>
        </div>

      ) : (
        /* ━━ VISTA LISTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="event_upcoming" className="text-[#34d399] text-[20px]" />
              <h2 className="text-[14px] font-semibold text-[#e4e1e9]">Próximas reservas</h2>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState icon="event_available" title="Sin reservas próximas" subtitle="No hay reservas confirmadas a futuro." />
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.slice(0, 8).map((r) => (
                  <ReservationRow
                    key={r.id}
                    r={r}
                    onOpen={openUnit}
                    onCancel={async () => {
                      await api.patchReservation(r.id, "CANCELLED");
                      setReservations(await api.reservations());
                      toast.success("Reserva cancelada");
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="history" className="text-[#908fa0] text-[20px]" />
              <h2 className="text-[14px] font-semibold text-[#e4e1e9]">Historial</h2>
            </div>
            {spaceReservations.filter((r) => new Date(r.date) < new Date() || r.status !== "CONFIRMED").length === 0 ? (
              <EmptyState icon="event_busy" title="Sin historial" />
            ) : (
              <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto">
                {spaceReservations
                  .filter((r) => new Date(r.date) < new Date() || r.status !== "CONFIRMED")
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 15)
                  .map((r) => <ReservationRow key={r.id} r={r} compact onOpen={openUnit} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal nueva reserva ── */}
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
            <NewReservationModal
              spaces={spaces}
              units={units}
              defaultSpaceId={selectedSpaceId}
              defaultDate={preDate}
              defaultHour={preHour}
              onClose={() => setShowNew(false)}
              onCreated={async () => {
                setReservations(await api.reservations());
                setShowNew(false);
                toast.success("Reserva creada");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function ReservationRow({
  r, compact, onOpen, onCancel,
}: {
  r: Reservation; compact?: boolean; onOpen: (uid: string) => void; onCancel?: () => Promise<void>;
}) {
  const st = reservationStatusStyle(r.status);
  const isUpcoming = new Date(r.date) >= new Date() && r.status === "CONFIRMED";
  return (
    <div
      className="relative overflow-hidden p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-[#1f1f24] transition-colors"
      style={{ background: "#1b1b20" }}
    >
      {isUpcoming && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#571bc1]" />}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
          <span className="text-[16px] font-bold text-[#d0bcff] tnum leading-none">{new Date(r.date).getDate()}</span>
          <span className="text-[10px] uppercase text-[#908fa0]">
            {new Date(r.date).toLocaleDateString("es-AR", { month: "short" })}
          </span>
        </div>
        <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(70,69,84,0.4)" }} />
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-semibold text-[#e4e1e9] truncate">{r.space?.name ?? "Espacio"}</span>
          <span className="text-[11px] font-mono text-[#908fa0] truncate">
            {r.startHour}–{r.endHour} · {r.attendees}p{r.purpose ? ` · ${r.purpose}` : ""}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onOpen(r.unitId)}
          className="text-[11px] font-mono text-[#c7c4d7] hover:text-[#c0c1ff] flex items-center gap-1"
        >
          <Icon name="apartment" className="text-[12px]" />
          {r.unit?.label ?? "—"}
        </button>
        <StatusBadge style={st} />
        {!compact && isUpcoming && onCancel && (
          <Btn size="sm" variant="danger" icon="close" onClick={onCancel}>
            Cancelar
          </Btn>
        )}
      </div>
    </div>
  );
}

function NewReservationModal({
  spaces, units, defaultSpaceId, defaultDate, defaultHour, onClose, onCreated,
}: {
  spaces: AmenitySpace[];
  units: Unit[];
  defaultSpaceId: string;
  defaultDate: string;
  defaultHour: number;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [spaceId, setSpaceId] = useState(defaultSpaceId || spaces[0]?.id || "");
  const [unitId, setUnitId] = useState("");
  const [date, setDate] = useState(defaultDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [startHour, setStartHour] = useState(defaultHour ? `${String(defaultHour).padStart(2, "0")}:00` : "19:00");
  const [endHour, setEndHour] = useState(defaultHour ? `${String(Math.min(defaultHour + 4, 23)).padStart(2, "0")}:00` : "23:00");
  const [purpose, setPurpose] = useState("");
  const [attendees, setAttendees] = useState(2);
  const [saving, setSaving] = useState(false);

  const space = spaces.find((s) => s.id === spaceId);

  const submit = async () => {
    if (!spaceId || !unitId || !date) { toast.error("Completa todos los campos"); return; }
    setSaving(true);
    try {
      await api.createReservation({ unitId, spaceId, date: new Date(date).toISOString(), startHour, endHour, purpose, attendees });
      await onCreated();
    } catch (e: unknown) {
      toast.error((e instanceof Error ? e.message : null) || "No se pudo crear");
    } finally { setSaving(false); }
  };

  const inp = "bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]";
  const brd = { borderColor: "rgba(255,255,255,0.08)" };
  const lbl = "text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold";

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#6366f1]/15"><Icon name="event_available" className="text-[18px] text-[#c0c1ff]" /></div>
          <h3 className="text-[16px] font-semibold text-[#e4e1e9]">Nueva Reserva{space ? ` — ${space.name}` : ""}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]">
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Espacio</label>
            <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)} className={inp} style={brd}>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.emoji ? `${s.emoji} ` : ""}{s.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Unidad Solicitante</label>
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={inp} style={brd}>
              <option value="">Seleccionar...</option>
              {units.map((u) => <option key={u.id} value={u.id}>Depto {u.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} style={brd} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Asistentes</label>
            <input type="number" min={1} max={space?.capacity ?? 50} value={attendees} onChange={(e) => setAttendees(Number(e.target.value))} className={inp} style={brd} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Desde</label>
            <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className={inp} style={brd}>
              <option value="09:00">Mañana (09:00)</option>
              <option value="12:00">Mediodía (12:00)</option>
              <option value="19:00">Tarde/Noche (19:00)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={lbl}>Hasta</label>
            <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className={inp} style={brd}>
              <option value="13:00">13:00</option>
              <option value="16:00">16:00</option>
              <option value="23:00">23:00</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={lbl}>Motivo / Evento (opcional)</label>
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Ej: Cumpleaños familiar" className={inp} style={brd} />
        </div>
        {space && (
          <div className="flex items-start gap-2 text-[11px] font-mono text-[#908fa0] px-3 py-2.5 rounded-lg" style={{ background: "#1b1b20" }}>
            <Icon name="info" className="text-[14px] text-[#4cd7f6] flex-shrink-0 mt-0.5" />
            <span>
              {space.name} · Cap. {space.capacity} pax · {space.openFrom}–{space.openTo}
              {space.cleaningFee && space.cleaningFee !== "—" && ` · Limpieza: ${space.cleaningFee}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn variant="primary" icon="check" onClick={submit} disabled={saving}>
          {saving ? "Creando..." : "Confirmar Reserva"}
        </Btn>
      </div>
    </>
  );
}
