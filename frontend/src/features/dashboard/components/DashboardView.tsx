// src/features/dashboard/components/DashboardView.tsx
// Dashboard completo adaptado de modelo1 — usa React Router navigate en vez de setView

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { DashboardStats, MoveRequest } from "@/lib/types";
import { Card, KpiCard, SectionHeader, Btn, Spinner, EmptyState, Avatar } from "@/lib/primitives";
import {
  Icon, fmtDateTime, relativeTime, fmtMoney,
  packageStatusStyle, accessStatusStyle, incidentStatusStyle, priorityStyle, StatusBadge,
} from "@/lib/ui";

export function DashboardView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit, role, residentUnitId } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isResident = role === "RESIDENT";

  useEffect(() => {
    setLoading(true);
    const p = isResident && residentUnitId
      ? api.stats(undefined, residentUnitId)
      : api.stats(selectedBuildingId ?? undefined);
    p.then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
  }, [selectedBuildingId, role, residentUnitId]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-32 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg animate-shimmer" style={{ background: "#1a1a24" }} />
          ))}
        </div>
      </div>
    );
  }

  const k = stats.kpis;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(87,27,193,0.18)", filter: "blur(80px)" }} />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(128,131,255,0.12)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-gradient text-white text-[11px] font-semibold tracking-wide flex items-center gap-1 shadow-sm">
                <Icon name="bolt" className="text-[12px] text-[#4cd7f6]" fill />
                Consola Operacional
              </span>
              <span className="px-2 py-0.5 rounded text-[#4cd7f6] font-mono text-[11px]" style={{ background: "#2a292f" }}>
                TELEMETRÍA EN VIVO
              </span>
              {isResident && (
                <span className="px-2 py-0.5 rounded text-[#d0bcff] font-mono text-[11px] flex items-center gap-1" style={{ background: "rgba(208,188,255,0.12)" }}>
                  <Icon name="person" className="text-[12px]" />
                  Vista de Residente
                </span>
              )}
              {role === "PORTER" && (
                <span className="px-2 py-0.5 rounded text-[#06b6d4] font-mono text-[11px] flex items-center gap-1" style={{ background: "rgba(6,182,212,0.12)" }}>
                  <Icon name="support_agent" className="text-[12px]" />
                  Vista de Portería
                </span>
              )}
            </div>
            <h1 className="text-[28px] md:text-[32px] font-semibold text-[#f8fafc] tracking-tight">
              Panel de Control del Edificio
            </h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">
              Visión consolidada y en tiempo real de ocupación, encomiendas, flujos de acceso, reservas y estado operacional.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[18rem]">
            {/* Indicador de conexión pulsante */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#4cd7f6" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#4cd7f6" }} />
              </span>
              <span className="text-[12px] font-medium text-[#e4e1e9]">Recepción Conectada</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg" style={{ background: "#35343a" }}>
              <div className="flex items-center gap-2">
                <Icon name="domain" className="text-[20px] text-[#c0c1ff]" />
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-[#e4e1e9]">Ocupación del edificio</span>
                  <span className="text-[12px] text-[#c7c4d7] font-mono">{k.occupiedUnits}/{k.unitsCount} unidades</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[24px] font-semibold text-[#4cd7f6] tnum">{k.occupancyRate}%</div>
                <div className="text-[11px] text-[#908fa0]">activas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas + Telemetría */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grid 2x2 de acciones rápidas */}
        <div className="lg:col-span-2 rounded-xl p-4" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="bolt" className="text-[20px] text-[#4cd7f6]" fill />
            <h2 className="text-[14px] font-semibold text-[#e4e1e9]">Acciones Rápidas</h2>
            <span className="text-[11px] text-[#908fa0] ml-1">Operaciones prioritarias de portería y conserjería</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {role === "ADMIN" && (
              <>
                <QuickActionCard icon="add_alert" label="Reportar Incidente" sub="Crear ticket SLA" color="#fbbf24" bg="rgba(251,191,36,0.12)" onClick={() => navigate("/incidentes")} />
                <QuickActionCard icon="inventory" label="Registrar Paquete" sub="Escanear código" color="#c0c1ff" bg="rgba(192,193,255,0.12)" onClick={() => navigate("/porteria")} />
                <QuickActionCard icon="campaign" label="Enviar Aviso" sub="Comunicado masivo" color="#4cd7f6" bg="rgba(76,215,246,0.12)" onClick={() => navigate("/notificaciones")} />
                <QuickActionCard icon="moving" label="Solicitud Mudanza" sub="Nuevo ingreso/egreso" color="#fbbf24" bg="rgba(251,191,36,0.12)" onClick={() => navigate("/mudanzas")} />
              </>
            )}
            {role === "PORTER" && (
              <>
                <QuickActionCard icon="inventory" label="Registrar Paquete" sub="Escanear código" color="#c0c1ff" bg="rgba(192,193,255,0.12)" onClick={() => navigate("/porteria")} />
                <QuickActionCard icon="person_add" label="Registrar Visita" sub="Ingreso & DNI" color="#4cd7f6" bg="rgba(76,215,246,0.12)" onClick={() => navigate("/porteria")} />
                <QuickActionCard icon="campaign" label="Enviar Aviso" sub="Comunicado" color="#c0c1ff" bg="rgba(192,193,255,0.12)" onClick={() => navigate("/notificaciones")} />
                <QuickActionCard icon="moving" label="Ver Mudanzas" sub="Pendientes" color="#fbbf24" bg="rgba(251,191,36,0.12)" onClick={() => navigate("/mudanzas")} />
              </>
            )}
            {role === "RESIDENT" && (
              <>
                <QuickActionCard icon="calendar_add_on" label="Nueva Reserva" sub="SUM o Parrilla" color="#d0bcff" bg="rgba(208,188,255,0.12)" onClick={() => navigate("/reservas")} />
                <QuickActionCard icon="payments" label="Mis Expensas" sub="Ver liquidación" color="#34d399" bg="rgba(52,211,153,0.12)" onClick={() => navigate("/expensas")} />
                <QuickActionCard icon="view_in_ar" label="Mi Unidad" sub="Vista 360°" color="#c0c1ff" bg="rgba(192,193,255,0.12)" onClick={() => navigate("/vista360")} />
                <QuickActionCard icon="campaign" label="Notificaciones" sub="Mis avisos" color="#4cd7f6" bg="rgba(76,215,246,0.12)" onClick={() => navigate("/notificaciones")} />
              </>
            )}
          </div>
        </div>
        {/* Bloque de telemetría */}
        <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#e4e1e9] flex items-center gap-1.5">
              <Icon name="videocam" className="text-[18px] text-[#4cd7f6]" />
              Cámaras & Portón
            </span>
            <span className="text-[11px] font-mono font-bold text-[#4cd7f6] px-2 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.15)" }}>100% OK</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] rounded-xl p-3" style={{ background: "#131318" }}>
            {[
              { label: "Circuito Cerrado", val: "32/32 Online", color: "#4cd7f6" },
              { label: "Barrera Vehicular", val: "Portón Norte OK", color: "#34d399" },
              { label: "Control de Acceso", val: "Activo", color: "#4cd7f6" },
              { label: "Intercomunicador", val: "Operativo", color: "#34d399" },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="text-[#908fa0] text-[10px]">{label}</div>
                <div className="font-semibold" style={{ color }}>{val}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#908fa0] px-2 py-1.5 rounded-lg" style={{ background: "rgba(14,14,19,0.6)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#4cd7f6]" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4cd7f6]" />
            </span>
            <span>Monitoreo continuo activo</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Paquetes Pendientes" value={k.pendingPackages} delta={`${stats.monthly.packages} / 30d`} deltaColor="#06b6d4" icon="inventory" iconColor="#06b6d4" iconBg="rgba(6,182,212,0.12)" sub="En portería sin retirar" onClick={() => navigate("/porteria")} />
        <KpiCard label="Visitantes Adentro" value={k.insideVisitors} delta={`${stats.monthly.accesses} accesos / 30d`} deltaColor="#c0c1ff" icon="recent_actors" iconColor="#c0c1ff" iconBg="rgba(192,193,255,0.12)" sub="Dentro del perímetro ahora" onClick={() => navigate("/porteria")} />
        <KpiCard label="Incidentes Abiertos" value={k.openIncidents + k.inProgressIncidents} delta={`${k.inProgressIncidents} en proceso`} deltaColor="#fbbf24" icon="handyman" iconColor="#fbbf24" iconBg="rgba(251,191,36,0.12)" sub="Requieren atención" onClick={() => navigate("/incidentes")} />
        <KpiCard label="Reservas Activas" value={k.activeReservations} delta={`${stats.monthly.reservations} / 30d`} deltaColor="#34d399" icon="calendar_month" iconColor="#34d399" iconBg="rgba(52,211,153,0.12)" sub="Próximas a realizarse" onClick={() => navigate("/reservas")} />
      </div>

      {/* Expensas summary widget */}
      {stats.expenses && stats.expenses.count > 0 && (
        <div
          className="relative overflow-hidden rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(6,182,212,0.05) 100%)", border: "1px solid rgba(52,211,153,0.20)" }}
          onClick={() => navigate("/expensas")}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: "rgba(52,211,153,0.10)", filter: "blur(50px)" }} />
          <div className="relative flex items-center gap-3 flex-shrink-0">
            <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)" }}>
              <Icon name="payments" className="text-[22px] text-white" fill />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-[#34d399] font-semibold">Expensas del período</span>
              <span className="text-[13px] text-[#c7c4d7]">{stats.expenses.period}</span>
            </div>
          </div>
          <div className="relative flex items-center gap-6 flex-1 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#908fa0]">Facturado</span>
              <span className="text-[18px] font-bold tnum text-[#e4e1e9]">{fmtMoney(stats.expenses.total)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#908fa0]">Cobrado</span>
              <span className="text-[18px] font-bold tnum text-[#34d399]">{fmtMoney(stats.expenses.collected)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#908fa0]">Pendiente</span>
              <span className="text-[18px] font-bold tnum text-[#fbbf24]">{fmtMoney(stats.expenses.pending)}</span>
            </div>
            {stats.expenses.overdue > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-[#908fa0]">Morosas</span>
                <span className="text-[18px] font-bold tnum text-[#f43f5e]">{stats.expenses.overdue}</span>
              </div>
            )}
            <div className="flex flex-col items-center ml-auto">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#expGrad)" strokeWidth="3" strokeDasharray={`${(stats.expenses.rate / 100) * 97.4} 97.4`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px] font-bold tnum text-[#34d399]">{stats.expenses.rate}%</span>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#908fa0] mt-1">Cobro</span>
            </div>
          </div>
          <Icon name="chevron_right" className="text-[20px] text-[#908fa0] flex-shrink-0 hidden sm:block" />
        </div>
      )}

      {/* Mini-widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniWidget icon="domain" iconColor="#c0c1ff" iconBg="rgba(192,193,255,0.12)" label="Ocupación" value={`${k.occupancyRate}%`} sub={`${k.occupiedUnits}/${k.unitsCount} unidades`} onClick={() => navigate("/directorio")} />
        <MiniWidget icon="groups" iconColor="#d0bcff" iconBg="rgba(208,188,255,0.12)" label="Accesos" value={stats.monthly.accesses} sub="accesos / 30 días" onClick={() => navigate("/residentes")} />
        <MiniWidget icon="construction" iconColor="#fbbf24" iconBg="rgba(251,191,36,0.12)" label="SLA Mant." value="18h" sub="promedio resolución" onClick={() => navigate("/incidentes")} />
        <MiniWidget icon="trending_up" iconColor="#34d399" iconBg="rgba(52,211,153,0.12)" label="Cobranza" value={stats.expenses ? `${stats.expenses.rate}%` : "—"} sub={stats.expenses ? fmtMoney(stats.expenses.collected) : "sin datos"} onClick={() => navigate("/expensas")} />
      </div>

      {/* Chart + side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionHeader
            icon="analytics" iconColor="#c0c1ff"
            title="Actividad semanal (últimas 6 semanas)"
            subtitle="Visitas, encomiendas y mantenimientos"
            right={
              <div className="flex items-center gap-3 text-[11px] text-[#c7c4d7]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" /> Visitas</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" /> Encomiendas</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]" /> Mant.</span>
              </div>
            }
          />
          <WeeklyChart weeks={stats.weeks} />
        </Card>
        <Card>
          <SectionHeader icon="moving" iconColor="#fbbf24" title="Mudanzas" subtitle="Solicitudes próximas" />
          <MoveList buildingId={selectedBuildingId ?? undefined} />
        </Card>
      </div>

      {/* Recent activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader icon="inventory" iconColor="#c0c1ff" title="Encomiendas recientes" right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/porteria")}>Ver todas</Btn>} />
          <div className="flex flex-col gap-2 stagger-list">
            {stats.recent.packages.length === 0 ? (
              <EmptyState icon="inventory_2" title="Sin encomiendas recientes" />
            ) : (
              stats.recent.packages.map((p, i) => {
                const st = packageStatusStyle(p.status);
                return (
                  <div key={p.id} className="p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: "#1b1b20", ["--i" as any]: i }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon name="local_shipping" className="text-[18px] text-[#c0c1ff] flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-[#e4e1e9] truncate">{p.carrier}</span>
                        <span className="text-[11px] text-[#908fa0] font-mono truncate">{p.trackingCode} · {p.unit?.label ?? "—"} · {relativeTime(p.receivedAt)}</span>
                      </div>
                    </div>
                    <StatusBadge style={st} />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader icon="recent_actors" iconColor="#4cd7f6" title="Accesos recientes" right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/porteria")}>Ver bitácora</Btn>} />
          <div className="flex flex-col gap-2">
            {stats.recent.accesses.length === 0 ? (
              <EmptyState icon="person_off" title="Sin accesos recientes" />
            ) : (
              stats.recent.accesses.map((a) => {
                const st = accessStatusStyle(a.status);
                return (
                  <div key={a.id} className="p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: "#1b1b20" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={a.visitorName} color="#06b6d4" size={32} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-[#e4e1e9] truncate">{a.visitorName}</span>
                        <span className="text-[11px] text-[#908fa0] font-mono truncate">{a.gate} · {a.unit?.label ?? "—"} · {relativeTime(a.entryAt)}</span>
                      </div>
                    </div>
                    <StatusBadge style={st} pulse={a.status === "INSIDE"} />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader icon="handyman" iconColor="#fbbf24" title="Incidentes / Mantenimientos recientes" right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/incidentes")}>Ver todos</Btn>} />
          <div className="flex flex-col gap-2">
            {stats.recent.incidents.length === 0 ? (
              <EmptyState icon="build" title="Sin incidentes recientes" />
            ) : (
              stats.recent.incidents.map((inc) => {
                const st = incidentStatusStyle(inc.status);
                const pr = priorityStyle(inc.priority);
                return (
                  <div
                    key={inc.id}
                    className="p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer hover:bg-[#1f1f24] transition-colors"
                    style={{ background: "#1b1b20" }}
                    onClick={() => { setSelectedUnit(inc.unitId); navigate("/vista360"); }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-mono font-bold text-[#c0c1ff] flex-shrink-0">#{inc.code}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-[#e4e1e9] truncate">{inc.title}</span>
                        <span className="text-[11px] text-[#908fa0] font-mono truncate">{inc.unit?.label ?? "—"} · {relativeTime(inc.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusBadge style={pr} />
                      <StatusBadge style={st} pulse={inc.status === "IN_PROGRESS"} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader icon="calendar_month" iconColor="#34d399" title="Reservas recientes" right={<Btn size="sm" variant="soft" iconRight="arrow_forward" onClick={() => navigate("/reservas")}>Ver calendario</Btn>} />
          <div className="flex flex-col gap-2">
            {stats.recent.reservations.length === 0 ? (
              <EmptyState icon="event_busy" title="Sin reservas recientes" />
            ) : (
              stats.recent.reservations.map((r) => (
                <div key={r.id} className="p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: "#1b1b20" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon name="event_available" className="text-[18px] text-[#34d399] flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-medium text-[#e4e1e9] truncate">{r.space?.name ?? "Espacio"}</span>
                      <span className="text-[11px] text-[#908fa0] font-mono truncate">{r.unit?.label ?? "—"} · {fmtDateTime(r.date)} · {r.startHour}–{r.endHour}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#34d399] flex-shrink-0">{r.attendees}p</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ Weekly bar chart ============
function WeeklyChart({ weeks }: { weeks: { label: string; visits: number; packages: number; maintenance: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.visits + w.packages + w.maintenance));
  const niceMax = Math.max(4, Math.ceil(max / 4) * 4);
  const colors = { visits: "#6366f1", packages: "#8b5cf6", maintenance: "#4cd7f6" };
  const gridLines = [0.25, 0.5, 0.75, 1];
  return (
    <div className="relative w-full h-48 flex items-end gap-3 pt-2 pl-8">
      <div className="absolute inset-0 pl-8 pointer-events-none">
        {gridLines.map((g, i) => (
          <div key={i} className="absolute left-0 right-0 flex items-center" style={{ bottom: `calc(${g * 100}% - 1px)` }}>
            <span className="absolute left-0 w-7 text-right pr-1 text-[9px] font-mono text-[#64748b]">{Math.round(niceMax * g)}</span>
            <div className="ml-8 flex-1 border-t border-dashed" style={{ borderColor: "rgba(255,255,255,0.05)" }} />
          </div>
        ))}
      </div>
      {weeks.map((w, i) => {
        const total = w.visits + w.packages + w.maintenance;
        const heightPct = (total / niceMax) * 100;
        const isLast = i === weeks.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative z-10">
            <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap" style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ color: colors.visits }}>{w.visits}v</span>{" · "}
                <span style={{ color: colors.packages }}>{w.packages}p</span>{" · "}
                <span style={{ color: colors.maintenance }}>{w.maintenance}m</span>
              </div>
            </div>
            <div className="w-full rounded-t flex flex-col justify-end overflow-hidden transition-all group-hover:opacity-90 group-hover:scale-[1.02] origin-bottom"
              style={{ height: `${heightPct}%`, background: "rgba(255,255,255,0.04)", minHeight: "4px" }}>
              {w.maintenance > 0 && <div style={{ background: colors.maintenance, height: `${(w.maintenance / total) * 100}%` }} />}
              {w.packages > 0 && <div style={{ background: colors.packages, height: `${(w.packages / total) * 100}%` }} />}
              {w.visits > 0 && <div style={{ background: colors.visits, height: `${(w.visits / total) * 100}%` }} />}
            </div>
            <span className={`text-[11px] font-mono ${isLast ? "text-[#c0c1ff] font-bold" : "text-[#908fa0]"}`}>{w.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============ Move list ============
function MoveList({ buildingId }: { buildingId?: string }) {
  const [moves, setMoves] = useState<MoveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.moves({ status: "PENDING" }).then(setMoves).catch(() => setMoves([])).finally(() => setLoading(false));
  }, [buildingId]);
  if (loading) return <div className="py-6 flex justify-center"><Spinner /></div>;
  if (moves.length === 0) return <EmptyState icon="moving" title="Sin mudanzas pendientes" sub="No hay solicitudes en espera." />;
  return (
    <div className="flex flex-col gap-2">
      {moves.slice(0, 4).map((m) => (
        <div key={m.id} className="p-3 rounded-lg" style={{ background: "#1b1b20" }}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[13px] font-medium text-[#e4e1e9]">{m.unit?.label} · {m.unit?.tower}</span>
            <span className="text-[10px] font-mono uppercase tracking-wide text-[#fbbf24] bg-[#fbbf24]/10 px-1.5 py-0.5 rounded">
              {m.type === "MOVE_IN" ? "Ingreso" : "Egreso"}
            </span>
          </div>
          <div className="text-[11px] text-[#908fa0] font-mono">{fmtDateTime(m.date)} · {m.startHour}–{m.endHour}</div>
          {m.company && <div className="text-[11px] text-[#c7c4d7] mt-1">Empresa: {m.company}</div>}
        </div>
      ))}
    </div>
  );
}

function QuickAction({ icon, label, color, bg, onClick }: { icon: string; label: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: "#1b1b20", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="p-1 rounded-md transition-transform group-hover:scale-110" style={{ background: bg, color }}>
        <Icon name={icon} className="text-[16px]" fill />
      </div>
      <span className="text-[12px] font-medium text-[#c7c4d7] group-hover:text-[#e4e1e9] transition-colors">{label}</span>
    </button>
  );
}

function QuickActionCard({ icon, label, sub, color, bg, onClick }: { icon: string; label: string; sub: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.15)] hover:shadow-lg cursor-pointer"
      style={{ background: "#131318", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="p-2 rounded-xl transition-transform group-hover:scale-110" style={{ background: bg }}>
        <Icon name={icon} className="text-[22px]" style={{ color }} fill />
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold text-[#e4e1e9] leading-tight">{label}</span>
        <span className="text-[10px] text-[#908fa0] mt-0.5">{sub}</span>
      </div>
    </button>
  );
}


function MiniWidget({ icon, iconColor, iconBg, label, value, sub, onClick }: { icon: string; iconColor: string; iconBg: string; label: string; value: React.ReactNode; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group relative overflow-hidden rounded-lg p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:border-[#6366f1]/30 text-left w-full" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: iconBg, filter: "blur(16px)" }} />
      <div className="relative p-1.5 rounded-md transition-transform group-hover:scale-110 flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
        <Icon name={icon} className="text-[18px]" fill />
      </div>
      <div className="relative flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-[#908fa0] font-semibold">{label}</span>
        <span className="text-[18px] font-bold tnum leading-tight" style={{ color: iconColor }}>{value}</span>
        <span className="text-[10px] text-[#c7c4d7] truncate">{sub}</span>
      </div>
    </button>
  );
}
