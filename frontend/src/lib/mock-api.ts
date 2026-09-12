// src/lib/mock-api.ts — Cliente API simulado (sin backend real)
import {
  MOCK_BUILDINGS, MOCK_UNITS, MOCK_RESIDENTS, MOCK_PACKAGES, MOCK_ACCESSES,
  MOCK_SPACES, MOCK_RESERVATIONS, MOCK_INCIDENTS, MOCK_MOVES, MOCK_NOTIFICATIONS,
  MOCK_EXPENSES_DATA, MOCK_EXPENSE_TRENDS, MOCK_STATS, delay,
} from "./mock-data";
import type {
  Building, Unit, Package, AccessLog, AmenitySpace, Reservation,
  Incident, MoveRequest, Notification, DashboardStats, ExpensesData, ExpenseTrends,
} from "./types";

// Estado mutable en memoria para simular operaciones CRUD
let packages = [...MOCK_PACKAGES];
let accesses = [...MOCK_ACCESSES];
let incidents = [...MOCK_INCIDENTS];
let reservations = [...MOCK_RESERVATIONS];
let moves = [...MOCK_MOVES];
let notifications = [...MOCK_NOTIFICATIONS];
let expenses = { ...MOCK_EXPENSES_DATA, expenses: [...MOCK_EXPENSES_DATA.expenses] };

let nextId = 1000;
const uid = () => `mock-${nextId++}`;

export const mockApi = {
  // Buildings
  buildings: async () => { await delay(); return MOCK_BUILDINGS; },

  // Units
  units: async (params: { buildingId?: string; q?: string; tower?: string; occupied?: boolean } = {}) => {
    await delay();
    let units = [...MOCK_UNITS];
    if (params.q) {
      const q = params.q.toLowerCase();
      units = units.filter((u) => u.label.toLowerCase().includes(q) || u.code.toLowerCase().includes(q) || u.residents?.some((r) => r.fullName.toLowerCase().includes(q)));
    }
    if (params.tower) units = units.filter((u) => u.tower === params.tower);
    if (params.occupied !== undefined) units = units.filter((u) => u.occupied === params.occupied);
    return units;
  },
  unit: async (id: string) => { await delay(); return MOCK_UNITS.find((u) => u.id === id) ?? MOCK_UNITS[0]; },
  unit360: async (id: string) => { await delay(); const u = MOCK_UNITS.find((u) => u.id === id) ?? MOCK_UNITS[0]; return { ...u, building: MOCK_BUILDINGS[0], packages: packages.filter((p) => p.unitId === id), accesses: accesses.filter((a) => a.unitId === id), reservations: reservations.filter((r) => r.unitId === id) as any, incidents: incidents.filter((i) => i.unitId === id), moveRequests: moves.filter((m) => m.unitId === id), notifications: notifications.filter((n) => n.unitId === id), stats30: { packages: 3, accesses: 8, reservations: 2, incidents: 1, pendingPackages: 2, openIncidents: 1 } }; },

  // Packages
  packages: async (params: { unitId?: string; status?: string } = {}) => {
    await delay();
    let p = [...packages];
    if (params.unitId) p = p.filter((x) => x.unitId === params.unitId);
    if (params.status) p = p.filter((x) => x.status === params.status);
    return p;
  },
  createPackage: async (body: any) => { await delay(200); const np = { id: uid(), ...body, receivedAt: new Date().toISOString(), unit: MOCK_UNITS.find((u) => u.id === body.unitId) ? { code: MOCK_UNITS.find((u) => u.id === body.unitId)!.code, label: MOCK_UNITS.find((u) => u.id === body.unitId)!.label, tower: MOCK_UNITS.find((u) => u.id === body.unitId)!.tower, floor: MOCK_UNITS.find((u) => u.id === body.unitId)!.floor } : undefined }; packages = [np, ...packages]; return np; },
  patchPackage: async (id: string, body: any) => { await delay(200); packages = packages.map((p) => p.id === id ? { ...p, ...body } : p); return packages.find((p) => p.id === id)!; },

  // Access logs
  accessLogs: async (params: { unitId?: string; status?: string } = {}) => {
    await delay();
    let a = [...accesses];
    if (params.unitId) a = a.filter((x) => x.unitId === params.unitId);
    if (params.status) a = a.filter((x) => x.status === params.status);
    return a;
  },
  createAccess: async (body: any) => { await delay(200); const unit = MOCK_UNITS.find((u) => u.id === body.unitId); const na = { id: uid(), ...body, entryAt: new Date().toISOString(), status: "INSIDE", gate: body.gate ?? "Portería Principal", unit: unit ? { code: unit.code, label: unit.label, tower: unit.tower, floor: unit.floor } : undefined }; accesses = [na, ...accesses]; return na; },
  exitAccess: async (id: string) => { await delay(200); accesses = accesses.map((a) => a.id === id ? { ...a, status: "EXITED", exitAt: new Date().toISOString() } : a); return accesses.find((a) => a.id === id)!; },

  // Spaces
  spaces: async (buildingId?: string) => { await delay(); return buildingId ? MOCK_SPACES.filter((s) => s.buildingId === buildingId) : MOCK_SPACES; },

  // Residents
  residents: async (params: { buildingId?: string; unitId?: string; q?: string } = {}) => {
    await delay();
    let r = MOCK_RESIDENTS.map((res) => ({ ...res, unit: MOCK_UNITS.find((u) => u.id === res.unitId) as any }));
    if (params.unitId) r = r.filter((x) => x.unitId === params.unitId);
    if (params.q) { const q = params.q.toLowerCase(); r = r.filter((x) => x.fullName.toLowerCase().includes(q) || x.email.toLowerCase().includes(q)); }
    return r;
  },
  createResident: async (body: any) => { await delay(200); return { id: uid(), avatarColor: "#6366f1", isContact: false, status: "ACTIVE", role: "TENANT", ...body }; },
  patchResident: async (id: string, body: any) => { await delay(200); return { id, ...body }; },
  deleteResident: async (_id: string) => { await delay(200); return { ok: true }; },

  // Reservations
  reservations: async (params: { unitId?: string; spaceId?: string } = {}) => {
    await delay();
    let r = [...reservations];
    if (params.unitId) r = r.filter((x) => x.unitId === params.unitId);
    if (params.spaceId) r = r.filter((x) => x.spaceId === params.spaceId);
    return r;
  },
  createReservation: async (body: any) => { await delay(200); const space = MOCK_SPACES.find((s) => s.id === body.spaceId); const unit = MOCK_UNITS.find((u) => u.id === body.unitId); const nr = { id: uid(), status: "CONFIRMED", attendees: 2, ...body, space, unit: unit ? { code: unit.code, label: unit.label, tower: unit.tower, floor: unit.floor } : undefined }; reservations = [nr, ...reservations]; return nr; },
  patchReservation: async (id: string, status: string) => { await delay(200); reservations = reservations.map((r) => r.id === id ? { ...r, status } : r); return reservations.find((r) => r.id === id)!; },

  // Incidents
  incidents: async (params: { unitId?: string; status?: string; type?: string; priority?: string } = {}) => {
    await delay();
    let i = [...incidents];
    if (params.unitId) i = i.filter((x) => x.unitId === params.unitId);
    if (params.status) i = i.filter((x) => x.status === params.status);
    if (params.type) i = i.filter((x) => x.type === params.type);
    if (params.priority) i = i.filter((x) => x.priority === params.priority);
    return i;
  },
  createIncident: async (body: any) => { await delay(200); const unit = MOCK_UNITS.find((u) => u.id === body.unitId); const ni = { id: uid(), code: 1008 + nextId, status: "OPEN", slaHours: 24, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...body, unit: unit ? { code: unit.code, label: unit.label, tower: unit.tower, floor: unit.floor } : undefined }; incidents = [ni, ...incidents]; return ni; },
  patchIncident: async (id: string, body: any) => { await delay(200); incidents = incidents.map((i) => i.id === id ? { ...i, ...body, updatedAt: new Date().toISOString() } : i); return incidents.find((i) => i.id === id)!; },

  // Moves
  moves: async (params: { unitId?: string; status?: string } = {}) => {
    await delay();
    let m = [...moves];
    if (params.unitId) m = m.filter((x) => x.unitId === params.unitId);
    if (params.status) m = m.filter((x) => x.status === params.status);
    return m;
  },
  createMove: async (body: any) => { await delay(200); const unit = MOCK_UNITS.find((u) => u.id === body.unitId); const nm = { id: uid(), status: "PENDING", ...body, unit: unit ? { code: unit.code, label: unit.label, tower: unit.tower, floor: unit.floor } : undefined }; moves = [nm, ...moves]; return nm; },
  patchMove: async (id: string, status: string) => { await delay(200); moves = moves.map((m) => m.id === id ? { ...m, status } : m); return moves.find((m) => m.id === id)!; },

  // Notifications
  notifications: async () => { await delay(); return [...notifications]; },
  markNotificationRead: async (id: string) => { await delay(100); notifications = notifications.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString(), read: true } : n); return notifications.find((n) => n.id === id)!; },
  markNotifRead: async (id: string) => { await delay(100); return mockApi.markNotificationRead(id); },
  createAnnouncement: async (body: any) => { await delay(200); const nn = { id: uid(), type: "ANNOUNCEMENT", readAt: null, createdAt: new Date().toISOString(), ...body }; notifications = [nn, ...notifications]; return nn; },
  createNotification: async (body: any) => { await delay(200); const nn = { id: uid(), type: "INFO", readAt: null, createdAt: new Date().toISOString(), ...body }; notifications = [nn, ...notifications]; return nn; },
  markAllNotifsRead: async () => { await delay(200); notifications = notifications.map((n) => ({ ...n, readAt: new Date().toISOString(), read: true })); return { readAll: true }; },
  deleteNotif: async (id: string) => { await delay(100); notifications = notifications.filter((n) => n.id !== id); return { ok: true }; },
  clearReadNotifs: async () => { await delay(200); notifications = notifications.filter((n) => !n.readAt); return { ok: true }; },
  clearAllNotifs: async () => { await delay(200); notifications = []; return { ok: true }; },

  // Stats
  stats: async () => { await delay(); return MOCK_STATS; },

  // Expenses
  expenses: async (params: { status?: string } = {}) => {
    await delay();
    if (!params.status) return expenses;
    return { ...expenses, expenses: expenses.expenses.filter((e) => e.status === params.status) };
  },
  patchExpense: async (id: string, body: any) => { await delay(200); expenses = { ...expenses, expenses: expenses.expenses.map((e) => e.id === id ? { ...e, ...body } : e) }; return expenses.expenses.find((e) => e.id === id)!; },
  registerPayment: async (id: string, body: { amount: number; method: string; reference?: string }) => {
    await delay(300);
    expenses = { ...expenses, expenses: expenses.expenses.map((e) => e.id === id ? { ...e, status: "PAID" as const, paidAmount: body.amount, method: body.method, reference: body.reference, paidAt: new Date().toISOString() } : e) };
    return expenses.expenses.find((e) => e.id === id)!;
  },
  createExpense: async (body: any) => { await delay(200); return { id: uid(), paidAmount: 0, status: "PENDING", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...body }; },
  deleteExpense: async (id: string) => { await delay(200); expenses = { ...expenses, expenses: expenses.expenses.filter((e) => e.id !== id) }; return { ok: true }; },
  generateExpenses: async () => { await delay(300); return { generated: 8, period: "2024-10", buildingId: "b1" }; },
  expenseTrends: async () => { await delay(); return MOCK_EXPENSE_TRENDS; },

  // Timeline
  timeline: async () => { await delay(); return { events: [], counts: { total: 0, PACKAGE: 0, ACCESS: 0, RESERVATION: 0, INCIDENT: 0, MOVE: 0, NOTIFICATION: 0 } }; },

  // Search
  search: async (q: string) => {
    await delay(200);
    const lq = q.toLowerCase();
    return {
      units: MOCK_UNITS.filter((u) => u.label.toLowerCase().includes(lq) || u.code.toLowerCase().includes(lq)),
      residents: MOCK_RESIDENTS.filter((r) => r.fullName.toLowerCase().includes(lq)).map((r) => ({ ...r, unit: MOCK_UNITS.find((u) => u.id === r.unitId) as any })),
      packages: packages.filter((p) => p.trackingCode.toLowerCase().includes(lq) || p.carrier.toLowerCase().includes(lq)).map((p) => ({ ...p, unit: { code: p.unit?.code ?? "", label: p.unit?.label ?? "" } })),
      incidents: incidents.filter((i) => i.title.toLowerCase().includes(lq)).map((i) => ({ ...i, unit: { code: i.unit?.code ?? "", label: i.unit?.label ?? "" } })),
    };
  },

  // Buildings
  createBuilding: async (body: any) => { await delay(200); return { id: uid(), code: "NW", shortName: "NW", city: "Buenos Aires", floors: 10, unitsCount: 40, ...body }; },
  patchBuilding: async (_id: string, body: any) => { await delay(200); return { ...MOCK_BUILDINGS[0], ...body }; },
  deleteBuilding: async (_id: string) => { await delay(200); return { ok: true }; },

  // Spaces
  createSpace: async (body: any) => { await delay(200); return { id: uid(), hourlyRate: 0, openFrom: "08:00", openTo: "22:00", ...body }; },
  patchSpace: async (_id: string, body: any) => { await delay(200); return body; },
  deleteSpace: async (_id: string) => { await delay(200); return { ok: true }; },

  // Staff
  staff: async () => { await delay(); return []; },
  createStaff: async (body: any) => { await delay(200); return { id: uid(), active: true, ...body }; },
  patchStaff: async (_id: string, body: any) => { await delay(200); return body; },
  deleteStaff: async (_id: string) => { await delay(200); return { ok: true }; },

  // Compat aliases
  residentUnitId: null as string | null,
};
