// src/features/vista360/components/Vista360View.tsx — vista de unidad completa
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Unit, Incident, Package, AccessLog, Reservation } from "@/lib/types";
import { Card, SectionHeader, Btn, EmptyState, Avatar } from "@/lib/primitives";
import { Icon, fmtDateTime, relativeTime, packageStatusStyle, incidentStatusStyle, priorityStyle, accessStatusStyle, reservationStatusStyle, StatusBadge, fmtMoney } from "@/lib/ui";
import { toast } from "sonner";

export function Vista360View() {
  const navigate = useNavigate();
  const { selectedUnitId, setSelectedUnit } = useApp();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [accesses, setAccesses] = useState<AccessLog[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedUnitId) return;
    setLoading(true);
    Promise.all([
      api.unit(selectedUnitId),
      api.incidents({ unitId: selectedUnitId }),
      api.packages({ unitId: selectedUnitId }),
      api.accessLogs({ unitId: selectedUnitId }),
      api.reservations({ unitId: selectedUnitId }),
    ]).then(([u, inc, pkg, acc, res]) => { setUnit(u); setIncidents(inc); setPackages(pkg); setAccesses(acc); setReservations(res); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedUnitId]);

  if (!selectedUnitId) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Icon name="search" className="text-[48px] text-[#464554] mb-4" />
        <p className="text-[16px] text-[#c7c4d7] font-medium">Seleccioná una unidad para ver su vista 360°</p>
        <Btn variant="soft" icon="domain" className="mt-4" onClick={() => navigate("/directorio")}>Ir al directorio</Btn>
      </div>
    );
  }

  if (loading) {
    return <div className="flex flex-col gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />)}</div>;
  }

  if (!unit) {
    return <Card><EmptyState icon="search_off" title="Unidad no encontrada" sub="La unidad seleccionada no existe o fue eliminada." /></Card>;
  }

  const resident = unit.residents?.[0];
  const openInc = incidents.filter((i) => ["OPEN", "IN_PROGRESS"].includes(i.status));
  const pendingPkg = packages.filter((p) => p.status === "PENDING");
  const insideNow = accesses.filter((a) => a.status === "INSIDE");

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(87,27,193,0.18)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: unit.occupied ? "rgba(99,102,241,0.20)" : "rgba(148,163,184,0.10)" }}>
              <Icon name="apartment" className="text-[40px]" style={{ color: unit.occupied ? "#c0c1ff" : "#94a3b8" }} fill />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[32px] font-bold text-[#f8fafc] tracking-tight">{unit.label}</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={unit.occupied ? { background: "rgba(52,211,153,0.12)", color: "#34d399" } : { background: "rgba(148,163,184,0.10)", color: "#94a3b8" }}>{unit.occupied ? "Ocupada" : "Desocupada"}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-[#c7c4d7] font-mono flex-wrap">
                <span className="flex items-center gap-1"><Icon name="domain" className="text-[14px]" />{unit.tower}</span>
                <span className="flex items-center gap-1"><Icon name="stairs" className="text-[14px]" />Piso {unit.floor}</span>
                <span className="flex items-center gap-1"><Icon name="straighten" className="text-[14px]" />{unit.area}m²</span>
                <span className="flex items-center gap-1"><Icon name="bedroom_parent" className="text-[14px]" />{unit.rooms}amb</span>
                <span className="font-mono text-[#908fa0]">{unit.code}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { v: openInc.length, label: "Incidentes", color: "#f43f5e", icon: "handyman", path: "/incidentes" },
              { v: pendingPkg.length, label: "Paquetes", color: "#fbbf24", icon: "inventory", path: "/porteria" },
              { v: insideNow.length, label: "Adentro", color: "#4cd7f6", icon: "recent_actors", path: "/porteria" },
            ].map((kpi) => (
              <button key={kpi.label} onClick={() => navigate(kpi.path)} className="p-3 rounded-xl flex flex-col items-center gap-1 hover:-translate-y-0.5 transition-all" style={{ background: "#35343a" }}>
                <div className="p-1.5 rounded-md" style={{ background: `${kpi.color}20`, color: kpi.color }}><Icon name={kpi.icon} className="text-[18px]" /></div>
                <span className="text-[20px] font-bold tnum" style={{ color: kpi.color }}>{kpi.v}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#908fa0]">{kpi.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Residents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <SectionHeader icon="group" iconColor="#d0bcff" title="Residentes" subtitle={`${unit.residents?.length ?? 0} registrados`} />
          {!unit.residents?.length ? <EmptyState icon="person_off" title="Sin residentes" /> : (
            <div className="flex flex-col gap-2">
              {unit.residents.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#1b1b20" }}>
                  <Avatar name={r.fullName} color={r.avatarColor} size={36} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-semibold text-[#e4e1e9] truncate">{r.fullName}</span>
                    <span className="text-[11px] text-[#908fa0]">{r.role === "OWNER" ? "Propietario" : r.role === "TENANT" ? "Inquilino" : "Dependiente"} {r.isContact ? "· Contacto" : ""}</span>
                  </div>
                  {r.email && <a href={`mailto:${r.email}`} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0] hover:text-[#c0c1ff] transition-colors"><Icon name="mail" className="text-[16px]" /></a>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Incidents */}
        <Card>
          <SectionHeader icon="handyman" iconColor="#fbbf24" title="Incidentes" subtitle={`${incidents.length} total`} right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/incidentes")}>Ver</Btn>} />
          {incidents.length === 0 ? <EmptyState icon="build" title="Sin incidentes" /> : (
            <div className="flex flex-col gap-2">
              {incidents.slice(0, 5).map((inc) => {
                const st = incidentStatusStyle(inc.status); const pr = priorityStyle(inc.priority);
                return (
                  <div key={inc.id} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "#1b1b20" }}>
                    <span className="text-[10px] font-mono font-bold text-[#c0c1ff] mt-0.5">#{inc.code}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[12px] font-medium text-[#e4e1e9] truncate">{inc.title}</span>
                      <div className="flex items-center gap-1 mt-0.5"><StatusBadge style={pr} /><StatusBadge style={st} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Packages */}
        <Card>
          <SectionHeader icon="inventory" iconColor="#c0c1ff" title="Encomiendas" subtitle={`${packages.length} total`} right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/porteria")}>Ver</Btn>} />
          {packages.length === 0 ? <EmptyState icon="inventory_2" title="Sin encomiendas" /> : (
            <div className="flex flex-col gap-2">
              {packages.slice(0, 5).map((p) => {
                const st = packageStatusStyle(p.status);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg" style={{ background: "#1b1b20" }}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-[#e4e1e9] truncate">{p.carrier}</span>
                      <span className="text-[10px] font-mono text-[#908fa0] truncate">#{p.trackingCode} · {relativeTime(p.receivedAt)}</span>
                    </div>
                    <StatusBadge style={st} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Accesses + Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader icon="recent_actors" iconColor="#4cd7f6" title="Accesos recientes" right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/porteria")}>Bitácora</Btn>} />
          {accesses.length === 0 ? <EmptyState icon="person_off" title="Sin accesos" /> : (
            <div className="flex flex-col gap-2">
              {accesses.slice(0, 6).map((a) => {
                const st = accessStatusStyle(a.status);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg" style={{ background: "#1b1b20" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={a.visitorName} color="#06b6d4" size={28} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-medium text-[#e4e1e9] truncate">{a.visitorName}</span>
                        <span className="text-[10px] font-mono text-[#908fa0]">{a.gate} · {relativeTime(a.entryAt)}</span>
                      </div>
                    </div>
                    <StatusBadge style={st} pulse={a.status === "INSIDE"} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card>
          <SectionHeader icon="calendar_month" iconColor="#34d399" title="Reservas" right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/reservas")}>Ver</Btn>} />
          {reservations.length === 0 ? <EmptyState icon="event_busy" title="Sin reservas" /> : (
            <div className="flex flex-col gap-2">
              {reservations.slice(0, 5).map((r) => {
                const st = reservationStatusStyle(r.status);
                return (
                  <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg" style={{ background: "#1b1b20" }}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-[#e4e1e9] truncate">{r.space?.name ?? "Espacio"}</span>
                      <span className="text-[10px] font-mono text-[#908fa0]">{fmtDateTime(r.date)} · {r.startHour}–{r.endHour}</span>
                    </div>
                    <StatusBadge style={st} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
