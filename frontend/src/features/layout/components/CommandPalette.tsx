// src/features/layout/components/CommandPalette.tsx
// Búsqueda global con ⌘K — adaptado de modelo1

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Icon } from "@/lib/ui";
import type { SearchResult } from "@/lib/types";

export function CommandPalette() {
  const navigate = useNavigate();
  const { paletteOpen, setPaletteOpen, selectedBuildingId, setSelectedUnit } = useApp();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
      if (e.key === "Escape" && paletteOpen) setPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [paletteOpen, setPaletteOpen]);

  // Focus input when opening
  useEffect(() => {
    if (paletteOpen) {
      setQ("");
      setResults(null);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [paletteOpen]);

  // Debounced search
  useEffect(() => {
    if (!paletteOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.search(q, selectedBuildingId ?? undefined);
        setResults(r);
        setActiveIdx(0);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, paletteOpen, selectedBuildingId]);

  if (!paletteOpen) return null;

  // Flatten results for keyboard nav
  const flat: { type: string; id: string; label: string; sub: string; icon: string; onSelect: () => void }[] = [];
  if (results) {
    results.units.forEach((u) =>
      flat.push({
        type: "Unidad", id: u.id,
        label: `${u.label} — ${u.tower} — Piso ${u.floor}`,
        sub: u.code, icon: "apartment",
        onSelect: () => { setSelectedUnit(u.id); navigate("/vista360"); setPaletteOpen(false); },
      })
    );
    results.residents.forEach((r) =>
      flat.push({
        type: "Residente", id: r.id,
        label: r.fullName,
        sub: `${r.role} · ${r.unit?.label ?? ""}`,
        icon: "person",
        onSelect: () => { if (r.unitId) { setSelectedUnit(r.unitId); navigate("/vista360"); } setPaletteOpen(false); },
      })
    );
    results.packages.forEach((p) =>
      flat.push({
        type: "Paquete", id: p.id,
        label: `${p.carrier} — ${p.trackingCode}`,
        sub: `${p.unit?.label ?? ""} · ${p.status}`,
        icon: "inventory_2",
        onSelect: () => { navigate("/porteria"); setPaletteOpen(false); },
      })
    );
    results.incidents.forEach((i) =>
      flat.push({
        type: "Incidente", id: i.id,
        label: `#${i.code} ${i.title}`,
        sub: `${i.unit?.label ?? ""} · ${i.status}`,
        icon: "build",
        onSelect: () => { if (i.unitId) { setSelectedUnit(i.unitId); navigate("/vista360"); } setPaletteOpen(false); },
      })
    );
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && flat[activeIdx]) { e.preventDefault(); flat[activeIdx].onSelect(); }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 animate-fade-in"
      style={{ background: "rgba(15,15,20,0.75)", backdropFilter: "blur(8px)" }}
      onClick={() => setPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden animate-scale-in"
        style={{
          background: "#20202d",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 64px -8px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Icon name="search" className="text-[20px] text-[#908fa0]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar unidades, residentes, paquetes, incidentes..."
            className="flex-1 bg-transparent text-[15px] text-[#e4e1e9] placeholder-[#64748b] focus:outline-none"
          />
          {loading && <Icon name="progress_activity" className="text-[18px] text-[#908fa0] animate-spin" />}
          <kbd className="px-1.5 py-0.5 rounded bg-[#2a292f] border border-[#464554]/50 text-[#908fa0] font-mono text-[11px]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <div className="px-3 py-8 text-center">
              <Icon name="keyboard" className="text-[32px] text-[#464554] mb-2" />
              <p className="text-[13px] text-[#908fa0]">
                Escribe al menos 2 caracteres para buscar en todo el sistema
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-[#64748b]">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#2a292f] border border-[#464554]/50 font-mono">↑↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#2a292f] border border-[#464554]/50 font-mono">↵</kbd>
                  abrir
                </span>
              </div>
            </div>
          ) : flat.length === 0 && !loading ? (
            <div className="px-3 py-8 text-center text-[13px] text-[#908fa0]">
              Sin resultados para "{q}"
            </div>
          ) : (
            flat.map((item, idx) => (
              <button
                key={`${item.type}-${item.id}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => item.onSelect()}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  idx === activeIdx ? "bg-[#2a292f]" : "hover:bg-[#1f1f24]"
                )}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.12)" }}>
                  <Icon name={item.icon} className="text-[18px] text-[#c0c1ff]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[14px] text-[#e4e1e9] truncate">{item.label}</span>
                  <span className="text-[12px] text-[#908fa0] font-mono truncate">{item.sub}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide text-[#908fa0] bg-[#2a292f] font-mono flex-shrink-0">
                  {item.type}
                </span>
                {idx === activeIdx && <Icon name="subdirectory_arrow_left" className="text-[16px] text-[#c0c1ff]" />}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2 text-[11px] text-[#908fa0] border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span>CondoTrack · Búsqueda global</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[#2a292f] font-mono">↑↓</kbd> navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[#2a292f] font-mono">↵</kbd> abrir
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
