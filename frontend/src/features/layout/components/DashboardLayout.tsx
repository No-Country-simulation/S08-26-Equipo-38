// src/features/layout/components/DashboardLayout.tsx
// Shell principal: Sidebar + Navbar + CommandPalette + Outlet para vistas hijas

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CommandPalette } from "./CommandPalette";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Icon } from "@/lib/ui";

export function DashboardLayout() {
  const { setBuildings, selectedBuildingId, setSelectedBuilding } = useApp();

  // Load buildings on mount
  useEffect(() => {
    api.buildings()
      .then((b) => {
        setBuildings(b);
        if (!selectedBuildingId && b.length > 0) setSelectedBuilding(b[0].id);
      })
      .catch(() => {/* backend no disponible aún */});
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0f14" }}>
      <Sidebar />
      <Navbar />
      <CommandPalette />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: { background: "#20202d", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e1e9" },
        }}
      />

      <main
        className="flex-1 w-full pt-16 pb-8 relative"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="md:pl-[15rem]">
          <div className="max-w-[80rem] mx-auto w-full py-6 px-4 md:px-6">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-auto border-t py-4 flex flex-col sm:flex-row items-center justify-between gap-2 px-4 md:px-6 md:pl-[calc(15rem+1.5rem)]"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0e0e13" }}
      >
        <div className="flex items-center gap-2 text-[12px] text-[#908fa0]">
          <div className="w-5 h-5 rounded bg-brand-gradient flex items-center justify-center">
            <Icon name="apartment" className="text-white text-[12px]" fill />
          </div>
          <span>CondoTrack · Plataforma de gestión integral de edificios y condominios</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#64748b] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            Sistema activo
          </span>
          <span>v1.0 · CondoTrack</span>
        </div>
      </footer>
    </div>
  );
}
