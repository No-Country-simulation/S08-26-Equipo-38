// src/lib/api.ts — CondoTrack API client
// Cambia entre backend real y mock según VITE_USE_MOCK en .env.local
import { mockApi } from "./mock-api";
import type {
  Building, Unit, Unit360, Package, AccessLog, AmenitySpace, Reservation,
  Incident, MoveRequest, Notification, Staff, DashboardStats, SearchResult,
  TimelineData, Expense, ExpensesData, ExpenseTrends,
} from "./types";

export type { Role } from "./types";
export type { Resident } from "./types";

// ─── Real API helpers ────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  return (json.data ?? json) as T;
}
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || `API ${res.status}`);
  return (json.data ?? json) as T;
}
async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || `API ${res.status}`);
  return (json.data ?? json) as T;
}
function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") sp.set(k, String(v)); });
  const s = sp.toString(); return s ? `?${s}` : "";
}

// ─── Real API object ─────────────────────────────────────────────────────────
const realApi = {
  buildings: () => get<Building[]>("/api/buildings"),
  createBuilding: (b: any) => post<Building>("/api/buildings", b),
  patchBuilding: (id: string, b: any) => patch<Building>("/api/buildings", { id, ...b }),
  deleteBuilding: (id: string) => fetch(`${BASE}/api/buildings/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  units: (params: { buildingId?: string; q?: string; floor?: number; tower?: string; occupied?: boolean } = {}) => get<Unit[]>(`/api/units${qs(params)}`),
  unit: (id: string) => get<Unit>(`/api/units/${id}`),
  unit360: (id: string) => get<Unit360>(`/api/units/${id}/360`),

  packages: (params: { unitId?: string; status?: string } = {}) => get<Package[]>(`/api/packages${qs(params)}`),
  createPackage: (b: any) => post<Package>("/api/packages", b),
  patchPackage: (id: string, b: any) => patch<Package>("/api/packages", { id, ...b }),

  accessLogs: (params: { unitId?: string; status?: string; visitorType?: string } = {}) => get<AccessLog[]>(`/api/access-logs${qs(params)}`),
  createAccess: (b: any) => post<AccessLog>("/api/access-logs", b),
  exitAccess: (id: string) => patch<AccessLog>("/api/access-logs", { id, status: "EXITED", exitAt: new Date().toISOString() }),

  spaces: (buildingId?: string) => get<AmenitySpace[]>(`/api/amenity-spaces${buildingId ? `?buildingId=${buildingId}` : ""}`),
  createSpace: (b: any) => post<AmenitySpace>("/api/amenity-spaces", b),
  patchSpace: (id: string, b: any) => patch<AmenitySpace>("/api/amenity-spaces", { id, ...b }),
  deleteSpace: (id: string) => fetch(`${BASE}/api/amenity-spaces/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  residents: (params: any = {}) => get<any[]>(`/api/residents${qs(params)}`),
  createResident: (b: any) => post<any>("/api/residents", b),
  patchResident: (id: string, b: any) => patch<any>("/api/residents", { id, ...b }),
  deleteResident: (id: string) => fetch(`${BASE}/api/residents/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  reservations: (params: { unitId?: string; spaceId?: string; status?: string } = {}) => get<Reservation[]>(`/api/reservations${qs(params)}`),
  createReservation: (b: any) => post<Reservation>("/api/reservations", b),
  patchReservation: (id: string, status: string) => patch<Reservation>("/api/reservations", { id, status }),

  incidents: (params: { unitId?: string; status?: string; type?: string; priority?: string } = {}) => get<Incident[]>(`/api/incidents${qs(params)}`),
  createIncident: (b: any) => post<Incident>("/api/incidents", b),
  patchIncident: (id: string, b: any) => patch<Incident>("/api/incidents", { id, ...b }),

  moves: (params: { unitId?: string; status?: string } = {}) => get<MoveRequest[]>(`/api/move-requests${qs(params)}`),
  createMove: (b: any) => post<MoveRequest>("/api/move-requests", b),
  patchMove: (id: string, status: string) => patch<MoveRequest>("/api/move-requests", { id, status }),

  notifications: (params: any = {}) => get<Notification[]>(`/api/notifications${qs(params)}`),
  createNotification: (b: any) => post<Notification>("/api/notifications", b),
  createAnnouncement: (b: any) => post<Notification>("/api/notifications/announcement", b),
  markNotifRead: (id: string) => patch<Notification>("/api/notifications", { id, read: true }),
  markNotificationRead: (id: string) => patch<Notification>("/api/notifications", { id, readAt: new Date().toISOString() }),
  markAllNotifsRead: () => patch<any>("/api/notifications", { readAll: true }),
  deleteNotif: (id: string) => fetch(`${BASE}/api/notifications/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),
  clearReadNotifs: () => fetch(`${BASE}/api/notifications/clear-read`, { method: "POST" }).then((r) => r.json()).then((j) => j.data ?? j),
  clearAllNotifs: () => fetch(`${BASE}/api/notifications/clear-all`, { method: "POST" }).then((r) => r.json()).then((j) => j.data ?? j),

  staff: (buildingId?: string) => get<Staff[]>(`/api/staff${buildingId ? `?buildingId=${buildingId}` : ""}`),
  createStaff: (b: any) => post<Staff>("/api/staff", b),
  patchStaff: (id: string, b: any) => patch<Staff>("/api/staff", { id, ...b }),
  deleteStaff: (id: string) => fetch(`${BASE}/api/staff/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  stats: (buildingId?: string, unitId?: string) => { const p: any = {}; if (buildingId) p.buildingId = buildingId; if (unitId) p.unitId = unitId; return get<DashboardStats>(`/api/stats${qs(p)}`); },
  timeline: (params: any = {}) => get<TimelineData>(`/api/timeline${qs(params)}`),

  expenses: (params: any = {}) => get<ExpensesData>(`/api/expenses${qs(params)}`),
  createExpense: (b: any) => post<Expense>("/api/expenses", b),
  patchExpense: (id: string, b: any) => patch<Expense>("/api/expenses", { id, ...b }),
  registerPayment: (id: string, b: { amount: number; method: string; reference?: string }) =>
    patch<Expense>("/api/expenses", { id, status: "PAID", paidAmount: b.amount, method: b.method, reference: b.reference, paidAt: new Date().toISOString() }),
  deleteExpense: (id: string) => fetch(`${BASE}/api/expenses/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),
  generateExpenses: (b: any) => post<any>("/api/expenses/generate", b),
  expenseTrends: (buildingId?: string) => get<ExpenseTrends>(`/api/expenses/trends${buildingId ? `?buildingId=${buildingId}` : ""}`),

  search: (q: string, buildingId?: string) => get<SearchResult>(`/api/search?q=${encodeURIComponent(q)}${buildingId ? `&buildingId=${buildingId}` : ""}`),
};

// ─── Selección: mock o real ──────────────────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const api = USE_MOCK ? mockApi : realApi;
