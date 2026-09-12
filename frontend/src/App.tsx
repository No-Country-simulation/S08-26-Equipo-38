// src/App.tsx
// Configuración principal del router con React Router DOM v7

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./features/layout";
import { DashboardView } from "./features/dashboard/components/DashboardView";

// ---- Placeholders para las vistas aún no desarrolladas ----
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
    <span className="material-symbols-outlined text-[64px] text-[#464554]">construction</span>
    <h2 className="text-xl font-semibold text-[#e4e1e9]">{title}</h2>
    <p className="text-[14px] text-[#908fa0]">Vista en desarrollo</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Layout principal — todas las rutas hijas renderizan dentro del <Outlet /> */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"      element={<DashboardView />} />
          <Route path="/directorio"     element={<PlaceholderView title="Directorio de Unidades" />} />
          <Route path="/residentes"     element={<PlaceholderView title="Residentes y Propietarios" />} />
          <Route path="/porteria"       element={<PlaceholderView title="Portería & Paquetes" />} />
          <Route path="/reservas"       element={<PlaceholderView title="Reservas de Espacios" />} />
          <Route path="/incidentes"     element={<PlaceholderView title="Incidentes & Mantenimiento" />} />
          <Route path="/mudanzas"       element={<PlaceholderView title="Mudanzas" />} />
          <Route path="/expensas"       element={<PlaceholderView title="Expensas y Cobros" />} />
          <Route path="/timeline"       element={<PlaceholderView title="Bitácora de Actividad" />} />
          <Route path="/vista360"       element={<PlaceholderView title="Vista 360° por Unidad" />} />
          <Route path="/notificaciones" element={<PlaceholderView title="Comunicaciones" />} />
          <Route path="/configuracion"  element={<PlaceholderView title="Configuración" />} />
        </Route>

        {/* Fallback para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
