// src/features/residentes/components/ResidentesView.tsx — adaptado de modelo1
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Resident, Unit } from "@/lib/types";
import { Card, SectionHeader, Btn, Avatar, EmptyState } from "@/lib/primitives";
import { Icon } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

type ResidentWithUnit = Resident & { unit?: { id: string; code: string; label: string; tower: string; floor: number; buildingId: string; building?: { shortName: string } } };

const ROLE_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  OWNER:    { label: "Propietario", color: "#c0c1ff", bg: "rgba(192,193,255,0.12)", icon: "verified_user" },
  TENANT:   { label: "Inquilino",   color: "#d0bcff", bg: "rgba(208,188,255,0.12)", icon: "person" },
  DEPENDENT:{ label: "Dependiente", color: "#4cd7f6", bg: "rgba(76,215,246,0.12)",  icon: "family_restroom" },
};
const STATUS_CFG: Record<string, { label: string; color: string; dot: string }> = {
  ACTIVE:       { label: "Residente Activo", color: "#34d399", dot: "#34d399" },
  NON_RESIDENT: { label: "No residente",     color: "#908fa0", dot: "#908fa0" },
  INACTIVE:     { label: "Inactivo",          color: "#64748b", dot: "#64748b" },
};
const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#34d399", "#fbbf24", "#f43f5e", "#ec4899"];

export function ResidentesView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit } = useApp();
  const [residents, setResidents] = useState<ResidentWithUnit[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<ResidentWithUnit | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.residents({ buildingId: selectedBuildingId ?? undefined }), api.units({ buildingId: selectedBuildingId ?? undefined })])
      .then(([r, u]) => { setResidents(r); setUnits(u); }).finally(() => setLoading(false));
  };
  useEffect(load, [selectedBuildingId]);

  const filtered = useMemo(() => residents.filter((r) => {
    if (roleFilter && r.role !== roleFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (q) { const ql = q.toLowerCase(); return r.fullName.toLowerCase().includes(ql) || r.email.toLowerCase().includes(ql); }
    return true;
  }), [residents, roleFilter, statusFilter, q]);

  const stats = { total: residents.length, owners: residents.filter((r) => r.role === "OWNER").length, tenants: residents.filter((r) => r.role === "TENANT").length, active: residents.filter((r) => r.status === "ACTIVE").length };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(139,92,246,0.12)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#d0bcff] font-mono text-[11px]" style={{ background: "#2a292f" }}>DIRECTORIO</span></div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Residentes y Propietarios</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">Administración de contactos oficiales, titulares registrales e inquilinos verificados.</p>
          </div>
          <Btn variant="primary" icon="person_add" onClick={() => { setEditing(null); setShowModal(true); }}>Agregar residente</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Total residentes", value: stats.total, color: "#c0c1ff", icon: "groups", bg: "rgba(192,193,255,0.12)" }, { label: "Propietarios", value: stats.owners, color: "#c0c1ff", icon: "verified_user", bg: "rgba(192,193,255,0.12)" }, { label: "Inquilinos", value: stats.tenants, color: "#d0bcff", icon: "person", bg: "rgba(208,188,255,0.12)" }, { label: "Activos", value: stats.active, color: "#34d399", icon: "check_circle", bg: "rgba(52,211,153,0.12)" }].map((s) => (
          <div key={s.label} className="p-4 rounded-lg flex items-center gap-3 transition-all hover:-translate-y-0.5" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="p-2 rounded-lg" style={{ background: s.bg, color: s.color }}><Icon name={s.icon} className="text-[20px]" /></div>
            <div className="flex flex-col"><span className="text-[24px] font-bold tnum leading-none" style={{ color: s.color }}>{s.value}</span><span className="text-[10px] uppercase tracking-wider text-[#908fa0] mt-1">{s.label}</span></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#908fa0]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o email..." className="w-full bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Rol:</span>
            {[{ v: "", l: "Todos" }, { v: "OWNER", l: "Propietarios" }, { v: "TENANT", l: "Inquilinos" }, { v: "DEPENDENT", l: "Dependientes" }].map((f) => (
              <button key={f.v} onClick={() => setRoleFilter(f.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", roleFilter === f.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{f.l}</button>
            ))}
            <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold ml-2">Estado:</span>
            {[{ v: "", l: "Todos" }, { v: "ACTIVE", l: "Activos" }, { v: "NON_RESIDENT", l: "No residentes" }, { v: "INACTIVE", l: "Inactivos" }].map((f) => (
              <button key={f.v} onClick={() => setStatusFilter(f.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", statusFilter === f.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{f.l}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-xl animate-shimmer" style={{ background: "#1a1a24" }} />)}</div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="person_off" title="Sin residentes" sub="Ajusta los filtros o agrega un nuevo residente." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const role = ROLE_CFG[r.role] ?? ROLE_CFG.TENANT;
            const status = STATUS_CFG[r.status] ?? STATUS_CFG.ACTIVE;
            return (
              <div key={r.id} className="rounded-xl p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-all" style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start gap-3">
                  <Avatar name={r.fullName} color={r.avatarColor} size={48} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-[#e4e1e9] truncate">{r.fullName}</span>
                      {r.isContact && <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider text-[#4cd7f6]" style={{ background: "rgba(76,215,246,0.10)" }}>Contacto</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon name={role.icon} className="text-[12px]" style={{ color: role.color }} />
                      <span className="text-[11px] font-medium" style={{ color: role.color }}>{role.label}</span>
                      <span className="text-[10px] text-[#908fa0]">·</span>
                      <span className="text-[10px] text-[#c7c4d7] flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />{status.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-[12px] text-[#c7c4d7] pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-1.5 truncate"><Icon name="mail" className="text-[14px] text-[#908fa0]" /><span className="truncate">{r.email}</span></div>
                  {r.phone && <div className="flex items-center gap-1.5"><Icon name="call" className="text-[14px] text-[#908fa0]" /><span>{r.phone}</span></div>}
                  <button onClick={() => { if (r.unit) { setSelectedUnit(r.unit.id); navigate("/vista360"); } }} className="flex items-center gap-1.5 hover:text-[#c0c1ff] transition-colors text-left mt-0.5">
                    <Icon name="apartment" className="text-[14px] text-[#908fa0]" />
                    <span className="font-mono text-[11px]">{r.unit?.label ?? "—"} · {r.unit?.tower ?? ""} · Piso {r.unit?.floor ?? ""}</span>
                  </button>
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <Btn size="sm" variant="ghost" icon="edit" onClick={() => { setEditing(r); setShowModal(true); }}>Editar</Btn>
                  <Btn size="sm" variant="danger" icon="delete" onClick={async () => {
                    if (!confirm(`¿Eliminar a ${r.fullName}?`)) return;
                    try { await api.deleteResident(r.id); setResidents((arr) => arr.filter((x) => x.id !== r.id)); toast.success("Residente eliminado"); }
                    catch { toast.error("No se pudo eliminar"); }
                  }}>Eliminar</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && <ResidentModal resident={editing} units={units} onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}

function ResidentModal({ resident, units, onClose, onSaved }: { resident: ResidentWithUnit | null; units: Unit[]; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(resident?.fullName ?? "");
  const [email, setEmail] = useState(resident?.email ?? "");
  const [phone, setPhone] = useState(resident?.phone ?? "");
  const [unitId, setUnitId] = useState(resident?.unitId ?? "");
  const [role, setRole] = useState<string>(resident?.role ?? "TENANT");
  const [status, setStatus] = useState<string>(resident?.status ?? "ACTIVE");
  const [avatarColor, setAvatarColor] = useState(resident?.avatarColor ?? AVATAR_COLORS[0]);
  const [isContact, setIsContact] = useState(resident?.isContact ?? false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!fullName || !email || !unitId) { toast.error("Completa nombre, email y unidad"); return; }
    setSaving(true);
    try {
      if (resident) { await api.patchResident(resident.id, { fullName, email, phone, role: role as any, status: status as any, avatarColor, isContact, unitId }); toast.success("Residente actualizado"); }
      else { await api.createResident({ unitId, fullName, email, phone, role, status, avatarColor, isContact }); toast.success("Residente creado"); }
      onSaved(); onClose();
    } catch (e: any) { toast.error(e.message || "No se pudo guardar"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in" style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden animate-scale-in" style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-[#6366f1]/15"><Icon name={resident ? "edit" : "person_add"} className="text-[18px] text-[#c0c1ff]" /></div><h3 className="text-[16px] font-semibold text-[#e4e1e9]">{resident ? "Editar residente" : "Nuevo residente"}</h3></div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]"><Icon name="close" className="text-[18px]" /></button>
        </div>
        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Nombre completo</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="María López" className="bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@ejemplo.com" className="bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Teléfono</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 11 ..." className="bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Unidad</label><select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }}><option value="">Seleccionar...</option>{units.map((u) => <option key={u.id} value={u.id}>{u.label} — {u.tower} — Piso {u.floor}</option>)}</select></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Rol</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(ROLE_CFG).map(([v, cfg]) => (
                <button key={v} onClick={() => setRole(v)} className={clsx("px-2.5 py-1.5 rounded text-[11px] font-medium border transition-all flex items-center gap-1", role === v ? "" : "bg-[#1b1b20] text-[#c7c4d7]")} style={role === v ? { background: cfg.bg, borderColor: cfg.color, color: cfg.color } : { borderColor: "rgba(255,255,255,0.08)" }}>
                  <Icon name={cfg.icon} className="text-[13px]" />{cfg.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Color de avatar</label>
            <div className="flex items-center gap-2">{AVATAR_COLORS.map((c) => <button key={c} onClick={() => setAvatarColor(c)} className={clsx("w-8 h-8 rounded-full transition-all", avatarColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#20202d] scale-110" : "hover:scale-110")} style={{ background: c }} />)}</div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg" style={{ background: "#1b1b20" }}>
            <button onClick={() => setIsContact(!isContact)} className="relative w-9 h-5 rounded-full transition-colors" style={{ background: isContact ? "#6366f1" : "#464554" }}>
              <span className={clsx("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform", isContact ? "translate-x-4" : "translate-x-0.5")} />
            </button>
            <div className="flex flex-col"><span className="text-[13px] text-[#e4e1e9] font-medium">Contacto oficial</span><span className="text-[11px] text-[#908fa0]">Recibe notificaciones y autorizaciones de la unidad</span></div>
          </label>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" icon="check" onClick={submit} disabled={saving}>{saving ? "Guardando..." : resident ? "Guardar cambios" : "Crear residente"}</Btn>
        </div>
      </div>
    </div>
  );
}
