// src/App.tsx — Todas las vistas reales integradas
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./features/layout";
import { DashboardView }       from "./features/dashboard/components/DashboardView";
import { DirectorioView }      from "./features/directorio/components/DirectorioView";
import { ResidentesView }      from "./features/residentes/components/ResidentesView";
import { PorteriaView }        from "./features/porteria/components/PorteriaView";
import { ReservasView }        from "./features/reservas/components/ReservasView";
import { IncidentesView }      from "./features/incidentes/components/IncidentesView";
import { MudanzasView }        from "./features/mudanzas/components/MudanzasView";
import { ExpensasView }        from "./features/expensas/components/ExpensasView";
import { Vista360View }        from "./features/vista360/components/Vista360View";
import { NotificacionesView }  from "./features/notificaciones/components/NotificacionesView";
import { ConfiguracionView }   from "./features/configuracion/components/ConfiguracionView";

// Bitácora de actividad — stub temporal
const TimelineView = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
    <span className="material-symbols-outlined text-[64px] text-[#464554]">history</span>
    <h2 className="text-xl font-semibold text-[#e4e1e9]">Bitácora de Actividad</h2>
    <p className="text-[14px] text-[#908fa0]">Timeline completo del edificio — próximamente</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"      element={<DashboardView />} />
          <Route path="/directorio"     element={<DirectorioView />} />
          <Route path="/residentes"     element={<ResidentesView />} />
          <Route path="/porteria"       element={<PorteriaView />} />
          <Route path="/reservas"       element={<ReservasView />} />
          <Route path="/incidentes"     element={<IncidentesView />} />
          <Route path="/mudanzas"       element={<MudanzasView />} />
          <Route path="/expensas"       element={<ExpensasView />} />
          <Route path="/timeline"       element={<TimelineView />} />
          <Route path="/vista360"       element={<Vista360View />} />
          <Route path="/notificaciones" element={<NotificacionesView />} />
          <Route path="/configuracion"  element={<ConfiguracionView />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
