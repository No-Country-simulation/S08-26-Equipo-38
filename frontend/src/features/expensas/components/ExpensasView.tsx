// src/features/expensas/components/ExpensasView.tsx — adaptado de modelo1
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import type { ExpensesData, Expense as ExpenseType } from "@/lib/types";
import { Card, SectionHeader, Btn, EmptyState, Avatar } from "@/lib/primitives";
import { Icon, fmtMoney, relativeTime } from "@/lib/ui";
import { clsx } from "clsx";
import { toast } from "sonner";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string; icon: string }> = {
  PAID:    { label: "Pagada",       color: "#34d399", bg: "rgba(52,211,153,0.12)",  dot: "#34d399", icon: "check_circle" },
  PENDING: { label: "Pendiente",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  dot: "#fbbf24", icon: "schedule" },
  OVERDUE: { label: "Vencida",      color: "#f43f5e", bg: "rgba(244,63,94,0.12)",   dot: "#f43f5e", icon: "warning" },
  PARTIAL: { label: "Pago parcial", color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   dot: "#06b6d4", icon: "pie_chart" },
};

function periodLabel(p: string): string {
  const [y, m] = p.split("-");
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${months[Number(m) - 1]} ${y}`;
}

export function ExpensasView() {
  const navigate = useNavigate();
  const { selectedBuildingId, setSelectedUnit, role, residentUnitId } = useApp();
  const [data, setData] = useState<ExpensesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [registering, setRegistering] = useState<ExpenseType | null>(null);
  const isResident = role === "RESIDENT";

  const load = () => {
    setLoading(true);
    api.expenses({
      buildingId: isResident ? undefined : (selectedBuildingId ?? undefined),
      unitId: isResident ? (residentUnitId ?? undefined) : undefined,
      status: statusFilter || undefined,
    }).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  };
  useEffect(load, [selectedBuildingId, statusFilter]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.expenses.filter((e) => {
      if (search) { const q = search.toLowerCase(); return (e.unit?.label ?? "").toLowerCase().includes(q) || (e.reference ?? "").toLowerCase().includes(q); }
      return true;
    });
  }, [data, search]);

  const periods = useMemo(() => Array.from(new Set((data?.expenses ?? []).map((e) => e.period))).sort().reverse(), [data]);

  const s = data?.summary;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-6" style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(52,211,153,0.10)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 rounded text-[#34d399] font-mono text-[11px]" style={{ background: "#2a292f" }}>FINANZAS</span></div>
            <h1 className="text-[28px] font-semibold text-[#f8fafc] tracking-tight">Expensas y Cobros</h1>
            <p className="text-[14px] text-[#c7c4d7] max-w-2xl">Gestión de expensas mensuales, control de pagos y seguimiento de morosidad.</p>
          </div>
          {s && (
            <div className="flex items-center gap-4 px-5 py-4 rounded-xl" style={{ background: "#35343a" }}>
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke={s.collectionRate >= 80 ? "#34d399" : s.collectionRate >= 60 ? "#fbbf24" : "#f43f5e"} strokeWidth="3" strokeDasharray={`${(s.collectionRate / 100) * 97.4} 97.4`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-[16px] font-bold tnum" style={{ color: s.collectionRate >= 80 ? "#34d399" : s.collectionRate >= 60 ? "#fbbf24" : "#f43f5e" }}>{s.collectionRate}%</span></div>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#908fa0] mt-1">Cobro</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[{ l: "Total facturado", v: fmtMoney(s.total), c: "#e4e1e9" }, { l: "Cobrado", v: fmtMoney(s.collected), c: "#34d399" }, { l: "Pendiente", v: fmtMoney(s.pending), c: "#fbbf24" }].map((r) => (
                  <div key={r.l} className="flex items-center justify-between gap-6">
                    <span className="text-[11px] text-[#908fa0]">{r.l}</span>
                    <span className="text-[13px] font-semibold tnum" style={{ color: r.c }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#908fa0]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar unidad o referencia..." className="w-full bg-[#1b1b20] text-[#e4e1e9] placeholder-[#64748b] text-[13px] pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1]" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">Estado:</span>
            {[{ v: "", l: "Todos" }, { v: "PAID", l: "Pagadas" }, { v: "PENDING", l: "Pendientes" }, { v: "OVERDUE", l: "Vencidas" }, { v: "PARTIAL", l: "Parcial" }].map((f) => (
              <button key={f.v} onClick={() => setStatusFilter(f.v)} className={clsx("px-2.5 py-1 rounded text-[11px] font-medium transition-all", statusFilter === f.v ? "bg-[#6366f1]/15 text-[#c0c1ff]" : "text-[#c7c4d7] hover:text-[#e4e1e9]")}>{f.l}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-lg animate-shimmer" style={{ background: "#1a1a24" }} />)}</div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="receipt_long" title="Sin expensas" sub="Ajusta los filtros para ver resultados." /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#908fa0] border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {["Unidad", "Período", "Monto", "Pagado", "Estado", "Vencimiento", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const st = STATUS_CFG[e.status] ?? STATUS_CFG.PENDING;
                  return (
                    <tr key={e.id} className="border-b hover:bg-[#1f1f24] transition-colors cursor-pointer" style={{ borderColor: "rgba(255,255,255,0.04)" }} onClick={() => { setSelectedUnit(e.unitId); navigate("/vista360"); }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {e.unit?.residents?.[0] && <Avatar name={e.unit.residents[0].fullName} color={e.unit.residents[0].avatarColor} size={28} />}
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#e4e1e9]">{e.unit?.label ?? "—"}</span>
                            <span className="text-[10px] font-mono text-[#908fa0]">{e.unit?.tower} · Piso {e.unit?.floor}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#c7c4d7]">{periodLabel(e.period)}</td>
                      <td className="px-4 py-3 text-[#e4e1e9] font-semibold tnum">{fmtMoney(e.amount)}</td>
                      <td className="px-4 py-3 text-[#34d399] tnum">{fmtMoney(e.paidAmount ?? 0)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: st.bg, color: st.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />{st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#908fa0] font-mono">{relativeTime(e.dueDate)}</td>
                      <td className="px-4 py-3 text-right">
                        {e.status !== "PAID" && (
                          <Btn size="sm" variant="primary" icon="payments" onClick={(ev: React.MouseEvent) => { ev.stopPropagation(); setRegistering(e); }}>Registrar pago</Btn>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {registering && (
        <PaymentModal expense={registering} onClose={() => setRegistering(null)} onSaved={() => { load(); setRegistering(null); toast.success("Pago registrado"); }} />
      )}
    </div>
  );
}

function PaymentModal({ expense, onClose, onSaved }: { expense: ExpenseType; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(expense.amount - (expense.paidAmount ?? 0));
  const [method, setMethod] = useState("TRANSFER");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const inp = "bg-[#1b1b20] text-[#e4e1e9] text-[13px] px-3 py-2 rounded-lg border focus:outline-none focus:border-[#6366f1] w-full";
  const brd = { borderColor: "rgba(255,255,255,0.08)" };
  const lbl = "text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold";

  const submit = async () => {
    if (!amount) { toast.error("Ingresa el monto"); return; }
    setSaving(true);
    try { await api.registerPayment(expense.id, { amount, method, reference }); onSaved(); }
    catch { toast.error("No se pudo registrar"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in" style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl overflow-hidden animate-scale-in" style={{ background: "#20202d", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-[#34d399]/15"><Icon name="payments" className="text-[18px] text-[#34d399]" /></div><h3 className="text-[16px] font-semibold text-[#e4e1e9]">Registrar pago — {expense.unit?.label}</h3></div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#2a292f] text-[#908fa0]"><Icon name="close" className="text-[18px]" /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><label className={lbl}>Monto ($)</label><input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inp} style={brd} /></div>
            <div className="flex flex-col gap-1.5"><label className={lbl}>Referencia</label><input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Comprobante..." className={inp} style={brd} /></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className={lbl}>Método de pago</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[{ v: "TRANSFER", l: "Transferencia", icon: "account_balance" }, { v: "CASH", l: "Efectivo", icon: "payments" }, { v: "CARD", l: "Tarjeta", icon: "credit_card" }, { v: "MERCADOPAGO", l: "MercadoPago", icon: "qr_code_2" }].map((m) => (
                <button key={m.v} onClick={() => setMethod(m.v)} className={clsx("flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium border transition-all", method === m.v ? "bg-[#6366f1]/15 text-[#c0c1ff] border-[#6366f1]/40" : "bg-[#1b1b20] text-[#c7c4d7]")} style={method !== m.v ? { borderColor: "rgba(255,255,255,0.08)" } : undefined}>
                  <Icon name={m.icon} className="text-[13px]" />{m.l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" icon="check" onClick={submit} disabled={saving}>{saving ? "Registrando..." : "Confirmar pago"}</Btn>
        </div>
      </div>
    </div>
  );
}
