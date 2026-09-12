// src/lib/api.ts — CondoTrack typed API client → apunta al backend Spring Boot (localhost:8080)
import type {
  Building, Unit, Unit360, Package, AccessLog, AmenitySpace, Reservation,
  Incident, MoveRequest, Notification, Staff, DashboardStats, SearchResult,
  TimelineData, Expense, ExpensesData, ExpenseTrends, Role,
} from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  // Spring Boot devuelve data directamente o envuelto en { data: ... }
  return (json.data ?? json) as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || `API ${res.status}`);
  return (json.data ?? json) as T;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || `API ${res.status}`);
  return (json.data ?? json) as T;
}

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  // Buildings
  buildings: () => get<Building[]>("/api/buildings"),
  createBuilding: (body: { name: string; shortName?: string; address: string; city?: string; floors?: number; unitsCount?: number }) =>
    post<Building>("/api/buildings", body),
  patchBuilding: (id: string, body: Partial<Building>) =>
    patch<Building>("/api/buildings", { id, ...body }),
  deleteBuilding: (id: string) =>
    fetch(`${BASE}/api/buildings/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  // Units
  units: (params: { buildingId?: string; q?: string; floor?: number; tower?: string; occupied?: boolean } = {}) =>
    get<Unit[]>(`/api/units${qs(params)}`),
  unit: (id: string) => get<Unit>(`/api/units/${id}`),
  unit360: (id: string) => get<Unit360>(`/api/units/${id}/360`),

  // Packages
  packages: (params: { unitId?: string; status?: string } = {}) =>
    get<Package[]>(`/api/packages${qs(params)}`),
  createPackage: (body: Partial<Package> & { unitId: string; carrier: string; trackingCode: string }) =>
    post<Package>("/api/packages", body),
  patchPackage: (id: string, body: Partial<Package>) =>
    patch<Package>("/api/packages", { id, ...body }),

  // Access logs
  accessLogs: (params: { unitId?: string; status?: string; visitorType?: string } = {}) =>
    get<AccessLog[]>(`/api/access-logs${qs(params)}`),
  createAccess: (body: { unitId: string; visitorName: string; visitorDni?: string; visitorType?: string; gate?: string; authorizedBy?: string }) =>
    post<AccessLog>("/api/access-logs", body),
  exitAccess: (id: string) =>
    patch<AccessLog>("/api/access-logs", { id, status: "EXITED", exitAt: new Date().toISOString() }),

  // Amenity spaces
  spaces: (buildingId?: string) =>
    get<AmenitySpace[]>(`/api/amenity-spaces${buildingId ? `?buildingId=${buildingId}` : ""}`),
  createSpace: (body: { buildingId: string; name: string; location: string; capacity: number; hourlyRate?: number; openFrom?: string; openTo?: string }) =>
    post<AmenitySpace>("/api/amenity-spaces", body),
  patchSpace: (id: string, body: Partial<AmenitySpace>) =>
    patch<AmenitySpace>("/api/amenity-spaces", { id, ...body }),
  deleteSpace: (id: string) =>
    fetch(`${BASE}/api/amenity-spaces/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  // Residents
  residents: (params: { unitId?: string; buildingId?: string; role?: string; status?: string; q?: string } = {}) =>
    get<(Resident & { unit?: { id: string; code: string; label: string; tower: string; floor: number; buildingId: string; building?: { shortName: string } } })[]>(`/api/residents${qs(params)}`),
  createResident: (body: { unitId: string; fullName: string; email: string; phone?: string; role?: string; status?: string; avatarColor?: string; isContact?: boolean }) =>
    post<Resident>("/api/residents", body),
  patchResident: (id: string, body: Partial<Resident>) =>
    patch<Resident>("/api/residents", { id, ...body }),
  deleteResident: (id: string) =>
    fetch(`${BASE}/api/residents/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  // Reservations
  reservations: (params: { unitId?: string; spaceId?: string; status?: string; from?: string } = {}) =>
    get<Reservation[]>(`/api/reservations${qs(params)}`),
  createReservation: (body: { unitId: string; spaceId: string; date: string; startHour: string; endHour: string; purpose?: string; attendees?: number }) =>
    post<Reservation>("/api/reservations", body),
  patchReservation: (id: string, status: string) =>
    patch<Reservation>("/api/reservations", { id, status }),

  // Incidents
  incidents: (params: { unitId?: string; status?: string; type?: string; priority?: string } = {}) =>
    get<Incident[]>(`/api/incidents${qs(params)}`),
  createIncident: (body: { unitId: string; type?: string; title: string; description?: string; priority?: string; reportedBy?: string }) =>
    post<Incident>("/api/incidents", body),
  patchIncident: (id: string, body: Partial<Incident>) =>
    patch<Incident>("/api/incidents", { id, ...body }),

  // Move requests
  moves: (params: { unitId?: string; status?: string } = {}) =>
    get<MoveRequest[]>(`/api/move-requests${qs(params)}`),
  createMove: (body: { unitId: string; date: string; startHour: string; endHour: string; type?: string; company?: string; notes?: string }) =>
    post<MoveRequest>("/api/move-requests", body),
  patchMove: (id: string, status: string) =>
    patch<MoveRequest>("/api/move-requests", { id, status }),

  // Notifications
  notifications: (params: { unitId?: string; unread?: boolean } = {}) =>
    get<Notification[]>(`/api/notifications${qs(params)}`),
  createNotification: (body: { title: string; message: string; type?: string; channel?: string; unitId?: string }) =>
    post<Notification>("/api/notifications", body),
  createAnnouncement: (body: { title: string; body: string; targetAll?: boolean }) =>
    post<Notification>("/api/notifications/announcement", body),
  markNotifRead: (id: string) => patch<Notification>("/api/notifications", { id, read: true }),
  markNotificationRead: (id: string) => patch<Notification>("/api/notifications", { id, readAt: new Date().toISOString() }),
  markAllNotifsRead: () => patch<{ readAll: boolean }>("/api/notifications", { readAll: true }),
  deleteNotif: (id: string) =>
    fetch(`${BASE}/api/notifications/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),
  clearReadNotifs: () =>
    fetch(`${BASE}/api/notifications/clear-read`, { method: "POST" }).then((r) => r.json()).then((j) => j.data ?? j),
  clearAllNotifs: () =>
    fetch(`${BASE}/api/notifications/clear-all`, { method: "POST" }).then((r) => r.json()).then((j) => j.data ?? j),

  // Staff
  staff: (buildingId?: string) =>
    get<Staff[]>(`/api/staff${buildingId ? `?buildingId=${buildingId}` : ""}`),
  createStaff: (body: { buildingId: string; fullName: string; role: string; email?: string; phone?: string }) =>
    post<Staff>("/api/staff", body),
  patchStaff: (id: string, body: Partial<Staff>) =>
    patch<Staff>("/api/staff", { id, ...body }),
  deleteStaff: (id: string) =>
    fetch(`${BASE}/api/staff/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),

  // Stats
  stats: (buildingId?: string, unitId?: string) => {
    const p: Record<string, string> = {};
    if (buildingId) p.buildingId = buildingId;
    if (unitId) p.unitId = unitId;
    return get<DashboardStats>(`/api/stats${qs(p)}`);
  },

  // Timeline
  timeline: (params: { buildingId?: string; unitId?: string; limit?: number } = {}) =>
    get<TimelineData>(`/api/timeline${qs(params)}`),

  // Expenses
  expenses: (params: { buildingId?: string; unitId?: string; period?: string; status?: string } = {}) =>
    get<ExpensesData>(`/api/expenses${qs(params)}`),
  createExpense: (body: { unitId: string; buildingId: string; period: string; amount: number; dueDate?: string }) =>
    post<Expense>("/api/expenses", body),
  patchExpense: (id: string, body: Partial<Expense> & { status?: string; paidAmount?: number; method?: string; reference?: string }) =>
    patch<Expense>("/api/expenses", { id, ...body }),
  registerPayment: (id: string, body: { amount: number; method: string; reference?: string }) =>
    patch<Expense>("/api/expenses", { id, status: "PAID", paidAmount: body.amount, method: body.method, reference: body.reference, paidAt: new Date().toISOString() }),
  deleteExpense: (id: string) =>
    fetch(`${BASE}/api/expenses/${id}`, { method: "DELETE" }).then((r) => r.json()).then((j) => j.data ?? j),
  generateExpenses: (body: { buildingId: string; period: string; amount?: number; dueDay?: number }) =>
    post<{ generated: number; period: string; buildingId: string }>("/api/expenses/generate", body),
  expenseTrends: (buildingId?: string) =>
    get<ExpenseTrends>(`/api/expenses/trends${buildingId ? `?buildingId=${buildingId}` : ""}`),

  // Search
  search: (q: string, buildingId?: string) =>
    get<SearchResult>(`/api/search?q=${encodeURIComponent(q)}${buildingId ? `&buildingId=${buildingId}` : ""}`),
};

export type { Role };

// Re-export Resident type for convenience (used in residents API)
export type { Resident } from "./types";
