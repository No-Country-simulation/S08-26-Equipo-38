// src/features/layout/components/DashboardLayout.tsx
// Contenedor principal del layout — Sidebar + Navbar + <Outlet /> para vistas hijas

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import type { Role } from "../types";

export function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // TODO: Obtener el rol real desde el contexto de autenticación (AuthContext / JWT)
  const role: Role = "ADMIN";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Sidebar fijo a la izquierda */}
      <Sidebar
        role={role}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Navbar fija en la parte superior */}
      <Navbar
        role={role}
        onOpenMobile={() => setMobileNavOpen(true)}
      />

      {/* Contenido principal — desplazado para no solaparse con Sidebar (240px) y Navbar (64px) */}
      <main
        className="transition-all duration-300"
        style={{
          marginLeft: "15rem",        /* ancho del sidebar en desktop */
          marginTop: "4rem",          /* altura del navbar (h-16 = 64px) */
          padding: "1.5rem",
          minHeight: "calc(100vh - 4rem)",
        }}
      >
        {/*
          <Outlet /> renderiza automáticamente el componente de la ruta hija activa.
          Ejemplo: /dashboard  → <DashboardView />
                   /porteria   → <PorteriaView />
                   /reservas   → <ReservasView />
        */}
        <Outlet />
      </main>
    </div>
  );
}
