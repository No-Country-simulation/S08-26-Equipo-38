// src/lib/types.ts — CondoTrack shared types (mirrors backend models)

export type Role = "ADMIN" | "PORTER" | "RESIDENT";

export interface Building {
  id: string;
  code: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  floors: number;
  unitsCount: number;
  _count?: { units: number; spaces: number; staff: number };
}

export interface Resident {
  id: string;
  unitId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: "OWNER" | "TENANT" | "DEPENDENT";
  status: "ACTIVE" | "INACTIVE" | "NON_RESIDENT";
  avatarColor: string;
  isContact: boolean;
}

export interface Unit {
  id: string;
  buildingId: string;
  code: string;
  floor: number;
  tower: string;
  label: string;
  area: number;
  rooms?: number;
  parkingSpot?: string | null;
  lockerId?: string | null;
  occupied: boolean;
  balanceDue: number;
  nextDueDate?: string | null;
  building?: { id: string; shortName: string; name: string };
  residents?: Resident[];
  pendingPackages?: number;
  openIncidents?: number;
  activeReservations?: number;
}

export interface Package {
  id: string;
  unitId: string;
  carrier: string;
  trackingCode: string;
  lockerCode?: string | null;
  status: "PENDING" | "NOTIFIED" | "DELIVERED" | "RETURNED";
  receivedAt: string;
  notifiedAt?: string | null;
  pickedUpAt?: string | null;
  receivedBy?: string | null;
  notes?: string | null;
  unit?: { code: string; label: string; tower: string; floor: number; building?: { shortName: string } };
}

export interface AccessLog {
  id: string;
  unitId: string;
  visitorName: string;
  visitorDni?: string | null;
  visitorType: "VISIT" | "DELIVERY" | "SERVICE" | "STAFF" | "RESIDENT";
  entryAt: string;
  exitAt?: string | null;
  gate: string;
  status: "INSIDE" | "EXITED" | "DENIED";
  authorizedBy?: string | null;
  notes?: string | null;
  unit?: { code: string; label: string; tower: string; floor: number; building?: { shortName: string } };
}

export interface AmenitySpace {
  id: string;
  buildingId: string;
  name: string;
  location: string;
  capacity: number;
  hourlyRate: number;
  openFrom: string;
  openTo: string;
  _count?: { reservations: number };
  // Visual/calendar extras (enriched in mock, omitted by backend)
  emoji?: string;
  subtitle?: string;
  todayStatus?: string;
  isAvailableToday?: boolean;
  allowedHours?: string;
  cleaningFee?: string;
  depositFee?: string;
  weeklyBookings?: number;
}


export interface Reservation {
  id: string;
  unitId: string;
  spaceId: string;
  date: string;
  startHour: string;
  endHour: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED";
  purpose?: string | null;
  attendees: number;
  space?: AmenitySpace;
  unit?: { code: string; label: string; tower: string; floor: number };
}

export interface Incident {
  id: string;
  unitId: string;
  code: number;
  type: "INCIDENT" | "MAINTENANCE" | "COMPLAINT";
  title: string;
  description: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTo?: string | null;
  reportedBy?: string | null;
  resolution?: string | null;
  slaHours: number;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Visual extras (from modelo2 — not stored in backend, enriched locally)
  progressPercent?: number;
  imageUrl?: string | null;
  slaRemaining?: string | null;
  unit?: { code: string; label: string; tower: string; floor: number; building?: { shortName: string } };
}


export interface MoveRequest {
  id: string;
  unitId: string;
  date: string;
  startHour: string;
  endHour: string;
  type: "MOVE_IN" | "MOVE_OUT";
  company?: string | null;
  status: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  unit?: { code: string; label: string; tower: string; floor: number };
}

export interface Notification {
  id: string;
  unitId?: string | null;
  title: string;
  body: string;
  message?: string;
  type: string;
  channel?: string;
  read?: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface Staff {
  id: string;
  buildingId: string;
  fullName: string;
  role: "ADMIN" | "PORTER" | "MAINTENANCE" | "SECURITY";
  email?: string | null;
  phone?: string | null;
  active: boolean;
}

// 360° unit detail (rich)
export interface Unit360 extends Unit {
  building: Building;
  residents: Resident[];
  packages: Package[];
  accesses: AccessLog[];
  reservations: (Reservation & { space: AmenitySpace })[];
  incidents: Incident[];
  moveRequests: MoveRequest[];
  notifications: Notification[];
  stats30: {
    packages: number;
    accesses: number;
    reservations: number;
    incidents: number;
    pendingPackages: number;
    openIncidents: number;
  };
}

export interface DashboardStats {
  kpis: {
    unitsCount: number;
    occupiedUnits: number;
    occupancyRate: number;
    pendingPackages: number;
    insideVisitors: number;
    openIncidents: number;
    inProgressIncidents: number;
    activeReservations: number;
    pendingMoves: number;
    unreadNotifs: number;
  };
  monthly: { packages: number; accesses: number; reservations: number; incidents: number };
  weeks: { label: string; visits: number; packages: number; maintenance: number }[];
  expenses: {
    total: number;
    collected: number;
    pending: number;
    overdue: number;
    rate: number;
    period: string;
    count: number;
  };
  recent: {
    packages: (Package & { unit?: { code: string; label: string } })[];
    accesses: (AccessLog & { unit?: { code: string; label: string } })[];
    incidents: (Incident & { unit?: { code: string; label: string } })[];
    reservations: (Reservation & { space?: AmenitySpace; unit?: { code: string; label: string } })[];
  };
}

export interface SearchResult {
  units: (Unit & { building?: { shortName: string }; residents?: { fullName: string }[] })[];
  residents: (Resident & { unit?: { code: string; label: string } })[];
  packages: (Package & { unit?: { code: string; label: string } })[];
  incidents: (Incident & { unit?: { code: string; label: string } })[];
}

export type ViewKey =
  | "dashboard"
  | "directorio"
  | "residentes"
  | "porteria"
  | "reservas"
  | "incidentes"
  | "vista360"
  | "notificaciones"
  | "mudanzas"
  | "timeline"
  | "expensas"
  | "configuracion";

export interface Expense {
  id: string;
  unitId: string;
  buildingId: string;
  period: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
  paidAmount: number;
  dueDate: string;
  paidAt?: string | null;
  method?: string | null;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  unit?: { id: string; code: string; label: string; tower: string; floor: number; residents?: { fullName: string; avatarColor: string }[] };
}

export interface ExpensesData {
  expenses: Expense[];
  summary: {
    total: number;
    collected: number;
    pending: number;
    overdue: number;
    collectionRate: number;
    count: number;
  };
  byPeriod: { period: string; total: number; collected: number; pending: number; count: number; paid: number; overdue: number; partial: number; rate: number }[];
}

export interface ExpenseTrends {
  months: { period: string; label: string; total: number; collected: number; pending: number; rate: number; count: number; overdue: number }[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: "PACKAGE" | "ACCESS" | "RESERVATION" | "INCIDENT" | "MOVE" | "NOTIFICATION";
  action: string;
  title: string;
  description: string;
  unitCode?: string;
  unitLabel?: string;
  actor?: string;
  status?: string;
  icon: string;
  color: string;
}

export interface TimelineData {
  events: TimelineEvent[];
  counts: {
    total: number;
    PACKAGE: number;
    ACCESS: number;
    RESERVATION: number;
    INCIDENT: number;
    MOVE: number;
    NOTIFICATION: number;
  };
}
