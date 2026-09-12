// src/features/notificaciones/components/NotificacionesView.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { Notification } from "@/lib/types";
import { Card, SectionHeader, Btn, EmptyState } from "@/lib/primitives";
import { Icon, relativeTime } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

const TYPE_CFG: Record<string, { icon: string; color: string; bg: string }> = {
  PACKAGE:    { icon: "inventory",    color: "#c0c1ff", bg: "rgba(192,193,255,0.12)" },
  ACCESS:     { icon: "recent_actors",color: "#4cd7f6", bg: "rgba(76,215,246,0.12)" },
  INCIDENT:   { icon: "handyman",     color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  RESERVATION:{ icon: "event",        color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  EXPENSE:    { icon: "payments",     color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  MOVE:       { icon: "moving",       color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  ANNOUNCEMENT:{ icon: "campaign",    color: "#d0bcff", bg: "rgba(208,188,255,0.12)" },
  SYSTEM:     { icon: "settings",     color: "#908fa0", bg: "rgba(148,163,184,0.10)" },
};

export function NotificacionesView() {
  const { selectedBuildingId } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    setLoading(true);
    api.notifications().then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
  };
  useEffect(load, [selectedBuildingId]);

  const unread = notifications.filter((n) => !n.readAt);
  const filtered = typeFilter ? notifications.filter((n) => n.type === typeFilter) : notifications;

  const markRead = async (id: string) => { await api.markNotificationRead(id); setNotifications((arr) => arr.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)); };
  const markAllRead = async () => { await Promise.all(unread.map((n) => api.markNotificationRead(n.id))); load(); toast.success(`${unread.length} notificaciones marcadas como leídas`); };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(208,188,255,0.10)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#d0bcff] font-mono text-[11px]" style={{ background: "#2a292f" }}>NOTIFICACIONES</span></div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Notificaciones & Avisos</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">Centro de mensajes del edificio, alertas de sistema y comunicaciones a residentes.</p>
          </div>
          <div className="flex items-center gap-2">
            {unread.length > 0 && <Btn variant="ghost" icon="done_all" onClick={markAllRead}>Marcar todas como leídas ({unread.length})</Btn>}
            <Btn variant="primary" icon="campaign" onClick={() => setShowNew(true)}>Nuevo aviso</Btn>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Tipo:</span>
          {[{ v: "", l: "Todos" }, ...Object.entries(TYPE_CFG).map(([v, cfg]) => ({ v, l: v.charAt(0) + v.slice(1).toLowerCase() }))].map((f) => (
            <button key={f.v} onClick={() => setTypeFilter(f.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", typeFilter === f.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{f.l}</button>
          ))}
        </div>
      </Card>

      {loading ? <div className="flex flex-col gap-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg animate-shimmer" style={{ background: "#1a1a24" }} />)}</div>
        : filtered.length === 0 ? <Card><EmptyState icon="notifications_off" title="Sin notificaciones" sub="No hay mensajes que coincidan." /></Card>
        : (
          <div className="flex flex-col gap-2">
            {filtered.map((n) => {
              const cfg = TYPE_CFG[n.type] ?? TYPE_CFG.SYSTEM;
              return (
                <div key={n.id} className={clsx("rounded-xl p-4 flex items-start gap-3 transition-all cursor-pointer hover:border-[#6366f1]/30", !n.readAt ? "border" : "border opacity-60")} style={{ background: "#1b1b20", borderColor: n.readAt ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.30)" }} onClick={() => !n.readAt && markRead(n.id)}>
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}><Icon name={cfg.icon} className="text-[18px]" /></div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#e4e1e9]">{n.title}</span>
                      {!n.readAt && <span className="w-2 h-2 rounded-full bg-[#6366f1] flex-shrink-0" />}
                    </div>
                    <p className="text-[12px] text-[#c7c4d7] mt-0.5">{n.body}</p>
                    <span className="text-[11px] text-[#908fa0] font-mono mt-1">{relativeTime(n.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {showNew && (
        <NewAnnouncementModal onClose={() => setShowNew(false)} onCreated={() => { load(); setShowNew(false); toast.success("Aviso enviado"); }} />
      )}
    </div>
  );
}

function NewAnnouncementModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [saving, setSaving] = useState(false);
  const inp = "bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1] w-full";
  const brd = { borderColor: "rgba(255,255,255,0.08)" };
  const submit = async () => {
    if (!title || !body) { toast.error("Completa título y mensaje"); return; }
    setSaving(true);
    try { await api.createAnnouncement({ title, body }); onCreated(); }
    catch { toast.error("No se pudo enviar"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in" style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl overflow-hidden animate-scale-in" style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-[#d0bcff]/15"><Icon name="campaign" className="text-[18px] text-[#d0bcff]" /></div><h3 className="text-[16px] font-semibold text-[#e4e1e9]">Nuevo aviso al edificio</h3></div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]"><Icon name="close" className="text-[18px]" /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Título</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Corte de agua programado" className={inp} style={brd} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Mensaje</label><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Detalla el aviso..." className={inp + " resize-none"} style={brd} /></div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" icon="send" onClick={submit} disabled={saving}>{saving ? "Enviando..." : "Enviar aviso"}</Btn>
        </div>
      </div>
    </div>
  );
}
