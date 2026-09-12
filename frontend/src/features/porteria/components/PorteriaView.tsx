// src/features/porteria/components/PorteriaView.tsx — adaptado de modelo1
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Package, AccessLog, Unit } from "@/lib/types";
import { Card, SectionHeader, Btn, Avatar, EmptyState } from "@/lib/primitives";
import { Icon, relativeTime, packageStatusStyle, accessStatusStyle, StatusBadge } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

type Tab = "packages" | "access" | "register";

export function PorteriaView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit } = useApp();
  const [tab, setTab] = useState<Tab>("packages");
  const [packages, setPackages] = useState<Package[]>([]);
  const [accesses, setAccesses] = useState<AccessLog[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [pkgFilter, setPkgFilter] = useState("");
  const [accFilter, setAccFilter] = useState("");
  const [pkgSearch, setPkgSearch] = useState("");
  const [accSearch, setAccSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([api.packages(), api.accessLogs(), api.units({ buildingId: selectedBuildingId ?? undefined })])
      .then(([p, a, u]) => { setPackages(p); setAccesses(a); setUnits(u); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedBuildingId]);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filteredPkgs = packages.filter((p) => {
    if (pkgFilter && p.status !== pkgFilter) return false;
    if (pkgSearch) { const nq = norm(pkgSearch); return norm(p.trackingCode).includes(nq) || norm(p.carrier).includes(nq) || norm(p.unit?.label ?? "").includes(nq); }
    return true;
  });
  const filteredAcc = accesses.filter((a) => {
    if (accFilter && a.status !== accFilter && a.visitorType !== accFilter) return false;
    if (accSearch) { const nq = norm(accSearch); return norm(a.visitorName).includes(nq) || norm(a.gate).includes(nq) || norm(a.unit?.label ?? "").includes(nq); }
    return true;
  });

  const pendingCount = packages.filter((p) => p.status === "PENDING").length;
  const insideCount = accesses.filter((a) => a.status === "INSIDE").length;

  const openUnit = (uid: string) => { setSelectedUnit(uid); navigate("/vista360"); };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(6,182,212,0.10)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#4cd7f6] font-mono text-[11px]" style={{ background: "#2a292f" }}>PORTERÍA</span></div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Portería & Paquetes</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">Registro de encomiendas, correspondencia y control de accesos en tiempo real.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[20rem]">
            {[{ label: "Paquetes pendientes", value: pendingCount, color: "#fbbf24", icon: "inventory" }, { label: "Visitantes adentro", value: insideCount, color: "#4cd7f6", icon: "recent_actors" }].map((kpi) => (
              <div key={kpi.label} className="p-2.5 rounded-lg flex items-center gap-2" style={{ background: "#35343a" }}>
                <div className="p-1.5 rounded-md" style={{ background: `${kpi.color}20`, color: kpi.color }}><Icon name={kpi.icon} className="text-[16px]" /></div>
                <div className="flex flex-col"><span className="text-[18px] font-semibold tnum leading-none" style={{ color: kpi.color }}>{kpi.value}</span><span className="text-[10px] text-[#c7c4d7] uppercase tracking-wider">{kpi.label}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg border w-fit" style={{ background: "#0e0e13", borderColor: "rgba(255,255,255,0.08)" }}>
        {([{ key: "packages", label: "Encomiendas", icon: "inventory" }, { key: "access", label: "Accesos & Visitas", icon: "recent_actors" }, { key: "register", label: "Registrar ingreso", icon: "person_add" }] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={clsx("px-3 py-1.5 rounded text-[12px] font-semibold transition-all flex items-center gap-1.5", tab === t.key ? "bg-brand-gradient text-white shadow-sm" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>
            <Icon name={t.icon} className="text-[14px]" />{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-lg animate-shimmer" style={{ background: "#1a1a24" }} />)}</div>
      ) : tab === "packages" ? (
        <Card>
          <SectionHeader icon="inventory" iconColor="#c0c1ff" title="Encomiendas en portería" subtitle={`${filteredPkgs.length} registros`}
            right={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative"><Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#908fa0]" /><input value={pkgSearch} onChange={(e) => setPkgSearch(e.target.value)} placeholder="Buscar..." className="w-32 bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[12px] pl-7 pr-2 py-1 rounded-md border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
                {[{ v: "", label: "Todos" }, { v: "PENDING", label: "Pendientes" }, { v: "NOTIFIED", label: "Notificados" }, { v: "DELIVERED", label: "Entregados" }].map((f) => (
                  <button key={f.v} onClick={() => setPkgFilter(f.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", pkgFilter === f.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{f.label}</button>
                ))}
              </div>
            }
          />
          {filteredPkgs.length === 0 ? <EmptyState icon="inventory_2" title="Sin encomiendas" sub="No hay paquetes que coincidan con el filtro." /> : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredPkgs.map((p) => {
                const st = packageStatusStyle(p.status);
                return (
                  <div key={p.id} className="p-4 rounded-lg flex flex-col gap-2 hover:bg-[#1f1f24] transition-colors" style={{ background: "#1b1b20" }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg flex-shrink-0" style={{ background: "rgba(99,102,241,0.12)" }}><Icon name="local_shipping" className="text-[18px] text-[#c0c1ff]" /></div>
                        <div className="flex flex-col min-w-0"><span className="text-[14px] font-semibold text-[#e4e1e9] truncate">{p.carrier}</span><span className="text-[11px] font-mono text-[#908fa0] truncate">#{p.trackingCode}</span></div>
                      </div>
                      <StatusBadge style={st} pulse={p.status === "PENDING"} />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#c7c4d7]">
                      <button onClick={() => openUnit(p.unitId)} className="flex items-center gap-1 hover:text-[#c0c1ff] transition-colors"><Icon name="apartment" className="text-[12px]" />{p.unit?.label ?? "—"} · {p.unit?.building?.shortName ?? ""}</button>
                      {p.lockerCode && <span className="px-1.5 py-0.5 rounded text-[#4cd7f6]" style={{ background: "#1a1a24" }}>{p.lockerCode}</span>}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#908fa0]">Recibido {relativeTime(p.receivedAt)}</span>
                      {p.status === "PENDING" && <Btn size="sm" variant="soft" icon="notifications_active" onClick={async () => { await api.patchPackage(p.id, { status: "NOTIFIED", notifiedAt: new Date().toISOString() }); toast.success("Residente notificado"); setPackages(await api.packages()); }}>Notificar</Btn>}
                      {p.status === "NOTIFIED" && <Btn size="sm" variant="ghost" icon="check" onClick={async () => { await api.patchPackage(p.id, { status: "DELIVERED", pickedUpAt: new Date().toISOString() }); toast.success("Paquete entregado"); setPackages(await api.packages()); }}>Registrar retiro</Btn>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : tab === "access" ? (
        <Card>
          <SectionHeader icon="recent_actors" iconColor="#4cd7f6" iconBg="rgba(76,215,246,0.15)" title="Bitácora de accesos" subtitle={`${filteredAcc.length} registros`}
            right={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative"><Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-[#908fa0]" /><input value={accSearch} onChange={(e) => setAccSearch(e.target.value)} placeholder="Buscar..." className="w-32 bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[12px] pl-7 pr-2 py-1 rounded-md border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
                {[{ v: "", label: "Todos" }, { v: "INSIDE", label: "Adentro" }, { v: "EXITED", label: "Salidos" }, { v: "DELIVERY", label: "Deliveries" }, { v: "SERVICE", label: "Servicios" }].map((f) => (
                  <button key={f.v} onClick={() => setAccFilter(f.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", accFilter === f.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{f.label}</button>
                ))}
              </div>
            }
          />
          {filteredAcc.length === 0 ? <EmptyState icon="person_off" title="Sin accesos" sub="No hay registros que coincidan." /> : (
            <div className="flex flex-col gap-2">
              {filteredAcc.map((a) => {
                const st = accessStatusStyle(a.status);
                return (
                  <div key={a.id} className="p-3 rounded-lg flex items-center justify-between gap-3 hover:bg-[#1f1f24] transition-colors" style={{ background: "#1b1b20" }}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar name={a.visitorName} color="#06b6d4" size={36} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-semibold text-[#e4e1e9] truncate">{a.visitorName}</span>
                        <span className="text-[11px] font-mono text-[#908fa0] truncate">{a.visitorDni ? `DNI ${a.visitorDni} · ` : ""}{a.visitorType} · {a.gate} · {relativeTime(a.entryAt)}</span>
                      </div>
                    </div>
                    <button onClick={() => openUnit(a.unitId)} className="text-[11px] font-mono text-[#c7c4d7] hover:text-[#c0c1ff] flex items-center gap-1 flex-shrink-0"><Icon name="apartment" className="text-[12px]" />{a.unit?.label ?? "—"}</button>
                    {a.status === "INSIDE" ? (
                      <Btn size="sm" variant="ghost" icon="logout" onClick={async () => { await api.exitAccess(a.id); setAccesses(await api.accessLogs()); toast.success("Salida registrada"); }}>Registrar salida</Btn>
                    ) : <StatusBadge style={st} />}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : (
        <RegisterTab units={units} onCreated={async () => { setAccesses(await api.accessLogs()); setTab("access"); }} />
      )}
    </div>
  );
}

function RegisterTab({ units, onCreated }: { units: Unit[]; onCreated: () => Promise<void> }) {
  const [unitId, setUnitId] = useState("");
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [type, setType] = useState("VISIT");
  const [gate, setGate] = useState("Molinete A");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!unitId || !name) { toast.error("Completa unidad y nombre"); return; }
    setSaving(true);
    try {
      await api.createAccess({ unitId, visitorName: name, visitorDni: dni, visitorType: type, gate, authorizedBy: "Portería" });
      toast.success("Ingreso registrado"); setName(""); setDni(""); await onCreated();
    } catch { toast.error("No se pudo registrar"); } finally { setSaving(false); }
  };

  return (
    <Card>
      <SectionHeader icon="person_add" iconColor="#34d399" iconBg="rgba(52,211,153,0.15)" title="Registrar ingreso de visitante" subtitle="Genera un registro en la bitácora de accesos" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Unidad destino</label>
          <div className="relative"><select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="appearance-none w-full bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }}><option value="">Seleccionar unidad...</option>{units.map((u) => <option key={u.id} value={u.id}>{u.label} — {u.tower} — Piso {u.floor}</option>)}</select><Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#908fa0] pointer-events-none" /></div>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Nombre del visitante</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Carlos Méndez" className="w-full bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">DNI (opcional)</label><input value={dni} onChange={(e) => setDni(e.target.value)} placeholder="28.453.221" className="w-full bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Tipo de visita</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[{ v: "VISIT", l: "Visita" }, { v: "DELIVERY", l: "Delivery" }, { v: "SERVICE", l: "Servicio" }, { v: "STAFF", l: "Personal" }].map((t) => (
              <button key={t.v} onClick={() => setType(t.v)} className={clsx("px-2.5 py-1.5 rounded text-[11px] font-medium border transition-all", type === t.v ? "bg-[#6366f1]/15 text-[#c0c1ff] border-[#6366f1]/40" : "bg-[#1b1b20] text-[#c7c4d7]")} style={type !== t.v ? { borderColor: "rgba(255,255,255,0.08)" } : undefined}>{t.l}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Acceso</label>
          <div className="flex items-center gap-1.5">
            {["Molinete A", "Molinete B", "Cochera"].map((g) => (
              <button key={g} onClick={() => setGate(g)} className={clsx("px-2.5 py-1.5 rounded text-[11px] font-medium border transition-all", gate === g ? "bg-[#6366f1]/15 text-[#c0c1ff] border-[#6366f1]/40" : "bg-[#1b1b20] text-[#c7c4d7]")} style={gate !== g ? { borderColor: "rgba(255,255,255,0.08)" } : undefined}>{g}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4"><Btn variant="primary" icon="check" onClick={submit} disabled={saving}>{saving ? "Registrando..." : "Registrar ingreso"}</Btn></div>
    </Card>
  );
}
