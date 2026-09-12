// src/lib/primitives.tsx — UI building blocks adaptados de modelo1 (sin "use client")
import { clsx } from "clsx";
import { Icon } from "@/lib/ui";
import type { ReactNode } from "react";

// ============ Card ============
export function Card({
  children, className, style, onClick, hover = false,
}: {
  children: ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void; hover?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx("rounded-xl p-5 transition-colors", hover && "hover:bg-[#2a292f] cursor-pointer", className)}
      style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.06)", ...style }}
    >
      {children}
    </div>
  );
}

// ============ Section Header ============
export function SectionHeader({
  icon, iconColor = "#c0c1ff", iconBg = "rgba(99,102,241,0.15)", title, subtitle, right,
}: {
  icon: string; iconColor?: string; iconBg?: string; title: string; subtitle?: string; right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 rounded-lg flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
          <Icon name={icon} className="text-[20px]" />
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-[18px] font-semibold text-[#e4e1e9] tracking-tight truncate">{title}</h2>
          {subtitle && <p className="text-[13px] text-[#c7c4d7] truncate">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  );
}

// ============ KPI Card ============
export function KpiCard({
  label, value, delta, deltaColor = "#34d399", icon, iconColor = "#c0c1ff",
  iconBg = "rgba(99,102,241,0.12)", sub, onClick,
}: {
  label: string; value: ReactNode; delta?: string; deltaColor?: string; icon: string;
  iconColor?: string; iconBg?: string; sub?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "p-4 rounded-lg flex flex-col gap-2 transition-all relative overflow-hidden group",
        onClick && "cursor-pointer hover:border-[#6366f1]/30 hover:-translate-y-0.5"
      )}
      style={{ background: "#1b1b20", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: iconBg, filter: "blur(20px)" }} />
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-[#908fa0] font-semibold">{label}</span>
        <div className="p-1.5 rounded-md transition-transform group-hover:scale-110" style={{ background: iconBg, color: iconColor }}>
          <Icon name={icon} className="text-[16px]" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[34px] font-bold text-[#f8fafc] tracking-tight tnum leading-none">{value}</span>
        {delta && <span className="text-[11px] font-mono tnum" style={{ color: deltaColor }}>{delta}</span>}
      </div>
      {sub && <span className="text-[12px] text-[#c7c4d7]">{sub}</span>}
    </div>
  );
}

// ============ Button ============
export function Btn({
  children, variant = "ghost", size = "md", icon, iconRight, onClick, className, type = "button", disabled,
}: {
  children?: ReactNode; variant?: "primary" | "ghost" | "secondary" | "danger" | "soft";
  size?: "sm" | "md"; icon?: string; iconRight?: string; onClick?: () => void;
  className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const sizes = { sm: "px-2.5 py-1 text-[11px]", md: "px-3 py-1.5 text-[12px]" };
  const variants: Record<string, string> = {
    primary: "bg-brand-gradient text-white font-semibold hover:opacity-95 shadow-sm",
    ghost: "bg-[#2a292f] hover:bg-[#35343a] text-[#e4e1e9] border",
    secondary: "bg-[#1b1b20] hover:bg-[#1f1f24] text-[#c7c4d7] border",
    danger: "border bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/15",
    soft: "bg-[#6366f1]/15 text-[#c0c1ff] hover:bg-[#6366f1]/25",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-lg inline-flex items-center gap-1.5 transition-all",
        sizes[size], variants[variant],
        disabled && "opacity-50 cursor-not-allowed", className
      )}
      style={["ghost", "secondary", "danger"].includes(variant) ? { borderColor: "rgba(255,255,255,0.08)" } : undefined}
    >
      {icon && <Icon name={icon} className={size === "sm" ? "text-[14px]" : "text-[16px]"} />}
      {children}
      {iconRight && <Icon name={iconRight} className={size === "sm" ? "text-[14px]" : "text-[16px]"} />}
    </button>
  );
}

// ============ Empty state ============
export function EmptyState({ icon = "inbox", title, sub }: { icon?: string; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.04)" }}>
        <Icon name={icon} className="text-[24px] text-[#464554]" />
      </div>
      <p className="text-[14px] font-medium text-[#c7c4d7]">{title}</p>
      {sub && <p className="text-[12px] text-[#908fa0] mt-1 max-w-xs">{sub}</p>}
    </div>
  );
}

// ============ Spinner ============
export function Spinner({ className = "text-[18px]" }: { className?: string }) {
  return <Icon name="progress_activity" className={clsx("animate-spin", className)} />;
}

// ============ Loading skeleton ============
export function LoadingCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl p-5 animate-shimmer" style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 rounded" style={{ background: "rgba(255,255,255,0.06)", width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}

// ============ Avatar ============
export function Avatar({ name, color = "#6366f1", size = 40 }: { name: string; color?: string; size?: number }) {
  const init = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, fontSize: size * 0.35 }}
    >
      {init}
    </div>
  );
}
