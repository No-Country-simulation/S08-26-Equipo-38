// src/lib/ui.tsx — Icon wrapper, StatusBadge, date/money formatters (adapted from modelo1)
import { clsx } from "clsx";

// Material Symbol icon helper (font loaded in index.html)
export function Icon({
  name,
  className,
  fill = false,
  style,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={clsx("material-symbols-outlined leading-none", className)}
      style={{ ...(fill ? { fontVariationSettings: '"FILL" 1' } : {}), ...style }}
      aria-hidden
    >
      {name}
    </span>
  );
}

// ============ Status badge helpers ============

type BadgeStyle = { bg: string; text: string; dot: string; label: string };

export function packageStatusStyle(status: string): BadgeStyle {
  switch (status) {
    case "PENDING":   return { bg: "rgba(251,191,36,.10)",  text: "#fbbf24", dot: "#fbbf24", label: "Pendiente" };
    case "NOTIFIED":  return { bg: "rgba(6,182,212,.10)",   text: "#06b6d4", dot: "#06b6d4", label: "Notificado" };
    case "DELIVERED": return { bg: "rgba(52,211,153,.10)",  text: "#34d399", dot: "#34d399", label: "Entregado" };
    case "RETURNED":  return { bg: "rgba(244,63,94,.10)",   text: "#f43f5e", dot: "#f43f5e", label: "Retornado" };
    default:          return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: status };
  }
}

export function accessStatusStyle(status: string): BadgeStyle {
  switch (status) {
    case "INSIDE":  return { bg: "rgba(6,182,212,.10)",   text: "#06b6d4", dot: "#06b6d4", label: "En el edificio" };
    case "EXITED":  return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: "Salió" };
    case "DENIED":  return { bg: "rgba(244,63,94,.10)",   text: "#f43f5e", dot: "#f43f5e", label: "Denegado" };
    default:        return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: status };
  }
}

export function incidentStatusStyle(status: string): BadgeStyle {
  switch (status) {
    case "OPEN":        return { bg: "rgba(244,63,94,.10)",   text: "#f43f5e", dot: "#f43f5e", label: "Abierto" };
    case "IN_PROGRESS": return { bg: "rgba(6,182,212,.10)",   text: "#06b6d4", dot: "#06b6d4", label: "En Proceso" };
    case "RESOLVED":    return { bg: "rgba(52,211,153,.10)",  text: "#34d399", dot: "#34d399", label: "Resuelto" };
    case "CLOSED":      return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: "Cerrado" };
    default:            return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: status };
  }
}

export function priorityStyle(p: string): BadgeStyle {
  switch (p) {
    case "LOW":    return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: "Baja" };
    case "NORMAL": return { bg: "rgba(6,182,212,.10)",   text: "#06b6d4", dot: "#06b6d4", label: "Normal" };
    case "HIGH":   return { bg: "rgba(251,191,36,.10)",  text: "#fbbf24", dot: "#fbbf24", label: "Alta" };
    case "URGENT": return { bg: "rgba(244,63,94,.10)",   text: "#f43f5e", dot: "#f43f5e", label: "Urgente" };
    default:       return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: p };
  }
}

export function reservationStatusStyle(status: string): BadgeStyle {
  switch (status) {
    case "CONFIRMED":  return { bg: "rgba(52,211,153,.10)",  text: "#34d399", dot: "#34d399", label: "Confirmada" };
    case "PENDING":    return { bg: "rgba(251,191,36,.10)",  text: "#fbbf24", dot: "#fbbf24", label: "Pendiente" };
    case "CANCELLED":  return { bg: "rgba(244,63,94,.10)",   text: "#f43f5e", dot: "#f43f5e", label: "Cancelada" };
    case "COMPLETED":  return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: "Cumplida" };
    default:           return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: status };
  }
}

export function moveStatusStyle(status: string): BadgeStyle {
  switch (status) {
    case "PENDING":   return { bg: "rgba(251,191,36,.10)",  text: "#fbbf24", dot: "#fbbf24", label: "Pendiente" };
    case "APPROVED":  return { bg: "rgba(6,182,212,.10)",   text: "#06b6d4", dot: "#06b6d4", label: "Aprobada" };
    case "COMPLETED": return { bg: "rgba(52,211,153,.10)",  text: "#34d399", dot: "#34d399", label: "Completada" };
    case "CANCELLED": return { bg: "rgba(244,63,94,.10)",   text: "#f43f5e", dot: "#f43f5e", label: "Cancelada" };
    default:          return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: status };
  }
}

export function expenseStatusStyle(status: string): BadgeStyle {
  switch (status) {
    case "PAID":    return { bg: "rgba(52,211,153,.10)",  text: "#34d399", dot: "#34d399", label: "Pagado" };
    case "PENDING": return { bg: "rgba(251,191,36,.10)",  text: "#fbbf24", dot: "#fbbf24", label: "Pendiente" };
    case "OVERDUE": return { bg: "rgba(244,63,94,.10)",   text: "#f43f5e", dot: "#f43f5e", label: "Vencido" };
    case "PARTIAL": return { bg: "rgba(6,182,212,.10)",   text: "#06b6d4", dot: "#06b6d4", label: "Parcial" };
    default:        return { bg: "rgba(148,163,184,.10)", text: "#94a3b8", dot: "#94a3b8", label: status };
  }
}

// ============ Badge component ============

export function StatusBadge({ style, pulse = false }: { style: BadgeStyle; pulse?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ background: style.bg, color: style.text }}
    >
      <span
        className={clsx("w-1.5 h-1.5 rounded-full", pulse && "animate-pulse")}
        style={{ background: style.dot }}
      />
      {style.label}
    </span>
  );
}

// ============ Date formatters ============

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDateShort(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export function fmtTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return `${fmtDate(d)} ${fmtTime(d)}`;
}

export function relativeTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  if (mins < 1) return "ahora";
  if (mins < 60) return future ? `en ${mins} min` : `hace ${mins} min`;
  if (hours < 24) return future ? `en ${hours} h` : `hace ${hours} h`;
  if (days < 30) return future ? `en ${days} d` : `hace ${days} d`;
  return fmtDate(date);
}

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
