// src/features/layout/types.ts
// Tipos compartidos para el layout de la aplicación

export type Role = "ADMIN" | "PORTER" | "RESIDENT";

export type ViewKey =
  | "dashboard"
  | "directorio"
  | "residentes"
  | "porteria"
  | "reservas"
  | "incidentes"
  | "mudanzas"
  | "expensas"
  | "timeline"
  | "vista360"
  | "notificaciones"
  | "configuracion";
