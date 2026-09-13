// src/lib/mock-data.ts — Datos de demostración para CondoTrack
import type {
  Building, Unit, Resident, Package, AccessLog, AmenitySpace, Reservation,
  Incident, MoveRequest, Notification, DashboardStats, ExpensesData, ExpenseTrends, MoveRequest as Move,
} from "./types";

// ── Buildings ──────────────────────────────────────────────────────────────
export const MOCK_BUILDINGS: Building[] = [
  { id: "b1", code: "TC", name: "Torres del Conde", shortName: "TC", address: "Av. del Libertador 1234", city: "Buenos Aires", floors: 18, unitsCount: 72, _count: { units: 72, spaces: 6, staff: 8 } },
  { id: "b2", code: "PV", name: "Parque Verde", shortName: "PV", address: "Av. Cabildo 4520", city: "Buenos Aires", floors: 12, unitsCount: 48, _count: { units: 48, spaces: 4, staff: 5 } },
];

// ── Residents ──────────────────────────────────────────────────────────────
export const MOCK_RESIDENTS: Resident[] = [
  { id: "r1", unitId: "u1", fullName: "Martín Guzmán", email: "martin@example.com", phone: "11 4567-8901", role: "OWNER", status: "ACTIVE", avatarColor: "#6366f1", isContact: true },
  { id: "r2", unitId: "u1", fullName: "Lucía Guzmán", email: "lucia@example.com", phone: "11 4567-8902", role: "DEPENDENT", status: "ACTIVE", avatarColor: "#8b5cf6", isContact: false },
  { id: "r3", unitId: "u2", fullName: "Ana Fernández", email: "ana@example.com", phone: "11 3456-7890", role: "TENANT", status: "ACTIVE", avatarColor: "#06b6d4", isContact: true },
  { id: "r4", unitId: "u3", fullName: "Carlos Ruiz", email: "carlos@example.com", phone: "11 2345-6789", role: "OWNER", status: "ACTIVE", avatarColor: "#34d399", isContact: true },
  { id: "r5", unitId: "u4", fullName: "Valentina López", email: "valen@example.com", phone: "11 9876-5432", role: "OWNER", status: "ACTIVE", avatarColor: "#fbbf24", isContact: true },
  { id: "r6", unitId: "u5", fullName: "Diego Morales", email: "diego@example.com", phone: "11 8765-4321", role: "TENANT", status: "ACTIVE", avatarColor: "#f43f5e", isContact: true },
  { id: "r7", unitId: "u6", fullName: "Sofía Pérez", email: "sofia@example.com", phone: "11 7654-3210", role: "OWNER", status: "NON_RESIDENT", avatarColor: "#c0c1ff", isContact: false },
  { id: "r8", unitId: "u7", fullName: "Facundo Torres", email: "facu@example.com", phone: "11 6543-2109", role: "OWNER", status: "ACTIVE", avatarColor: "#4cd7f6", isContact: true },
];

// ── Units ──────────────────────────────────────────────────────────────────
export const MOCK_UNITS: Unit[] = [
  { id: "u1", buildingId: "b1", code: "1A", floor: 1, tower: "Torre A", label: "1A - T.A", area: 72, rooms: 3, occupied: true, balanceDue: 0, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [MOCK_RESIDENTS[0], MOCK_RESIDENTS[1]], pendingPackages: 2, openIncidents: 1, activeReservations: 0 },
  { id: "u2", buildingId: "b1", code: "2B", floor: 2, tower: "Torre A", label: "2B - T.A", area: 85, rooms: 3, occupied: true, balanceDue: 42500, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [MOCK_RESIDENTS[2]], pendingPackages: 0, openIncidents: 0, activeReservations: 1 },
  { id: "u3", buildingId: "b1", code: "5C", floor: 5, tower: "Torre B", label: "5C - T.B", area: 95, rooms: 4, occupied: true, balanceDue: 0, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [MOCK_RESIDENTS[3]], pendingPackages: 1, openIncidents: 2, activeReservations: 0 },
  { id: "u4", buildingId: "b1", code: "8A", floor: 8, tower: "Torre A", label: "8A - T.A", area: 110, rooms: 4, occupied: true, balanceDue: 0, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [MOCK_RESIDENTS[4]], pendingPackages: 0, openIncidents: 0, activeReservations: 2 },
  { id: "u5", buildingId: "b1", code: "10B", floor: 10, tower: "Torre B", label: "10B - T.B", area: 78, rooms: 3, occupied: true, balanceDue: 85000, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [MOCK_RESIDENTS[5]], pendingPackages: 3, openIncidents: 1, activeReservations: 0 },
  { id: "u6", buildingId: "b1", code: "12A", floor: 12, tower: "Torre A", label: "12A - T.A", area: 125, rooms: 5, occupied: false, balanceDue: 127500, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [MOCK_RESIDENTS[6]], pendingPackages: 0, openIncidents: 0, activeReservations: 0 },
  { id: "u7", buildingId: "b1", code: "15C", floor: 15, tower: "Torre C", label: "15C - T.C", area: 140, rooms: 5, occupied: true, balanceDue: 0, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [MOCK_RESIDENTS[7]], pendingPackages: 1, openIncidents: 0, activeReservations: 1 },
  { id: "u8", buildingId: "b1", code: "18PH", floor: 18, tower: "Torre A", label: "PH - T.A", area: 220, rooms: 6, occupied: true, balanceDue: 0, building: { id: "b1", shortName: "TC", name: "Torres del Conde" }, residents: [], pendingPackages: 0, openIncidents: 0, activeReservations: 0 },
];

// ── Packages ───────────────────────────────────────────────────────────────
const NOW = new Date();
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();

export const MOCK_PACKAGES: Package[] = [
  { id: "p1", unitId: "u1", carrier: "Andreani", trackingCode: "AND-00123456", status: "PENDING", receivedAt: daysAgo(0.1), unit: { code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1 } },
  { id: "p2", unitId: "u1", carrier: "MercadoEnvíos", trackingCode: "ME-78901234", status: "NOTIFIED", receivedAt: daysAgo(1), notifiedAt: daysAgo(0.9), unit: { code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1 } },
  { id: "p3", unitId: "u3", carrier: "OCA", trackingCode: "OCA-45678901", status: "PENDING", receivedAt: daysAgo(2), unit: { code: "5C", label: "5C - T.B", tower: "Torre B", floor: 5 } },
  { id: "p4", unitId: "u5", carrier: "Correo Argentino", trackingCode: "CA-23456789", status: "PENDING", receivedAt: daysAgo(3), unit: { code: "10B", label: "10B - T.B", tower: "Torre B", floor: 10 } },
  { id: "p5", unitId: "u5", carrier: "DHL Express", trackingCode: "DHL-9012345", status: "NOTIFIED", receivedAt: daysAgo(4), notifiedAt: daysAgo(3.5), unit: { code: "10B", label: "10B - T.B", tower: "Torre B", floor: 10 } },
  { id: "p6", unitId: "u5", carrier: "Andreani", trackingCode: "AND-56789012", status: "PENDING", receivedAt: daysAgo(5), unit: { code: "10B", label: "10B - T.B", tower: "Torre B", floor: 10 } },
  { id: "p7", unitId: "u7", carrier: "FedEx", trackingCode: "FX-34567890", status: "PENDING", receivedAt: daysAgo(0.5), unit: { code: "15C", label: "15C - T.C", tower: "Torre C", floor: 15 } },
  { id: "p8", unitId: "u2", carrier: "MercadoEnvíos", trackingCode: "ME-67890123", status: "DELIVERED", receivedAt: daysAgo(10), pickedUpAt: daysAgo(8), unit: { code: "2B", label: "2B - T.A", tower: "Torre A", floor: 2 } },
  { id: "p9", unitId: "u4", carrier: "OCA", trackingCode: "OCA-11223344", status: "DELIVERED", receivedAt: daysAgo(15), pickedUpAt: daysAgo(14), unit: { code: "8A", label: "8A - T.A", tower: "Torre A", floor: 8 } },
];

// ── Access Logs ────────────────────────────────────────────────────────────
export const MOCK_ACCESSES: AccessLog[] = [
  { id: "a1", unitId: "u1", visitorName: "Juan Pérez", visitorDni: "35.678.901", visitorType: "VISIT", entryAt: daysAgo(0.02), gate: "Portería Principal", status: "INSIDE", authorizedBy: "Martín Guzmán", unit: { code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1 } },
  { id: "a2", unitId: "u3", visitorName: "Delivery Rappi", visitorType: "DELIVERY", entryAt: daysAgo(0.05), gate: "Portería Principal", status: "INSIDE", unit: { code: "5C", label: "5C - T.B", tower: "Torre B", floor: 5 } },
  { id: "a3", unitId: "u4", visitorName: "Plomero García", visitorDni: "28.901.234", visitorType: "SERVICE", entryAt: daysAgo(0.08), gate: "Portería Cochera", status: "INSIDE", authorizedBy: "Valentina López", unit: { code: "8A", label: "8A - T.A", tower: "Torre A", floor: 8 } },
  { id: "a4", unitId: "u2", visitorName: "Mensajero OCA", visitorType: "DELIVERY", entryAt: daysAgo(0.5), exitAt: daysAgo(0.45), gate: "Portería Principal", status: "EXITED", unit: { code: "2B", label: "2B - T.A", tower: "Torre A", floor: 2 } },
  { id: "a5", unitId: "u1", visitorName: "María Gómez", visitorDni: "40.123.456", visitorType: "VISIT", entryAt: daysAgo(1), exitAt: daysAgo(0.9), gate: "Portería Principal", status: "EXITED", authorizedBy: "Martín Guzmán", unit: { code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1 } },
  { id: "a6", unitId: "u6", visitorName: "Desconocido", visitorType: "VISIT", entryAt: daysAgo(2), gate: "Portería Principal", status: "DENIED", unit: { code: "12A", label: "12A - T.A", tower: "Torre A", floor: 12 } },
  { id: "a7", unitId: "u7", visitorName: "Técnico Fibertel", visitorDni: "32.456.789", visitorType: "SERVICE", entryAt: daysAgo(2), exitAt: daysAgo(1.9), gate: "Portería Cochera", status: "EXITED", authorizedBy: "Facundo Torres", unit: { code: "15C", label: "15C - T.C", tower: "Torre C", floor: 15 } },
];

// ── Amenity Spaces ─────────────────────────────────────────────────────────
// Extended with visual/calendar fields used in the interactive weekly view
export const MOCK_SPACES: AmenitySpace[] = [
  {
    id: "s1", buildingId: "b1", name: "Parrilla Norte", location: "PB - Sector Norte",
    capacity: 20, hourlyRate: 500, openFrom: "10:00", openTo: "23:00",
    emoji: "🔥", subtitle: "Parrilla con vista al parque",
    todayStatus: "Libre", isAvailableToday: true,
    allowedHours: "10:00 - 23:00", cleaningFee: "$3.500", depositFee: "$10.000",
    weeklyBookings: 4,
  },
  {
    id: "s2", buildingId: "b1", name: "SUM Grande", location: "PB - Ala Este",
    capacity: 80, hourlyRate: 2000, openFrom: "09:00", openTo: "01:00",
    emoji: "🎉", subtitle: "Salón de usos múltiples con cocina",
    todayStatus: "Ocupado hasta 01:00", isAvailableToday: false,
    allowedHours: "09:00 - 01:00", cleaningFee: "$12.000", depositFee: "$30.000",
    weeklyBookings: 2,
  },
  {
    id: "s3", buildingId: "b1", name: "Gimnasio", location: "Subsuelo",
    capacity: 15, hourlyRate: 0, openFrom: "06:00", openTo: "22:00",
    emoji: "💪", subtitle: "Equipamiento completo · Sin cargo",
    todayStatus: "Libre", isAvailableToday: true,
    allowedHours: "06:00 - 22:00", cleaningFee: "—", depositFee: "—",
    weeklyBookings: 12,
  },
  {
    id: "s4", buildingId: "b1", name: "Paddle", location: "Terraza - Piso 18",
    capacity: 4, hourlyRate: 800, openFrom: "08:00", openTo: "21:00",
    emoji: "🎾", subtitle: "Cancha techada con iluminación",
    todayStatus: "Libre", isAvailableToday: true,
    allowedHours: "08:00 - 21:00", cleaningFee: "—", depositFee: "$5.000",
    weeklyBookings: 3,
  },
  {
    id: "s5", buildingId: "b1", name: "Coworking", location: "Piso 2",
    capacity: 12, hourlyRate: 300, openFrom: "07:00", openTo: "22:00",
    emoji: "💼", subtitle: "Sala silenciosa · WiFi dedicado",
    todayStatus: "Libre", isAvailableToday: true,
    allowedHours: "07:00 - 22:00", cleaningFee: "—", depositFee: "—",
    weeklyBookings: 8,
  },
];

// ── Reservations ───────────────────────────────────────────────────────────
const futureDays = (n: number) => new Date(NOW.getTime() + n * 86400000).toISOString();

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: "rv1", unitId: "u4", spaceId: "s1", date: futureDays(1), startHour: "19:00", endHour: "23:00", status: "CONFIRMED", purpose: "Cumpleaños familiar", attendees: 15, space: MOCK_SPACES[0], unit: { code: "8A", label: "8A - T.A", tower: "Torre A", floor: 8 } },
  { id: "rv2", unitId: "u7", spaceId: "s2", date: futureDays(3), startHour: "20:00", endHour: "01:00", status: "CONFIRMED", purpose: "Reunión de egresados", attendees: 50, space: MOCK_SPACES[1], unit: { code: "15C", label: "15C - T.C", tower: "Torre C", floor: 15 } },
  { id: "rv3", unitId: "u2", spaceId: "s4", date: futureDays(2), startHour: "10:00", endHour: "12:00", status: "CONFIRMED", attendees: 4, space: MOCK_SPACES[3], unit: { code: "2B", label: "2B - T.A", tower: "Torre A", floor: 2 } },
  { id: "rv4", unitId: "u1", spaceId: "s1", date: daysAgo(5), startHour: "19:00", endHour: "23:00", status: "COMPLETED", purpose: "Asado", attendees: 12, space: MOCK_SPACES[0], unit: { code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1 } },
  { id: "rv5", unitId: "u3", spaceId: "s2", date: daysAgo(10), startHour: "18:00", endHour: "23:00", status: "COMPLETED", purpose: "Fiesta de cumpleaños", attendees: 40, space: MOCK_SPACES[1], unit: { code: "5C", label: "5C - T.B", tower: "Torre B", floor: 5 } },
  { id: "rv6", unitId: "u4", spaceId: "s2", date: futureDays(7), startHour: "20:00", endHour: "00:00", status: "CONFIRMED", purpose: "Fiesta de 15", attendees: 60, space: MOCK_SPACES[1], unit: { code: "8A", label: "8A - T.A", tower: "Torre A", floor: 8 } },
];

// ── Incidents ──────────────────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
  { id: "i1", unitId: "u1", code: 1001, type: "MAINTENANCE", title: "Goteo en baño principal", description: "Pérdida de agua en cañería bajo mesada del baño. Se escucha goteo constante.", priority: "HIGH", status: "OPEN", slaHours: 24, slaRemaining: "SLA: 18h restantes", createdAt: daysAgo(1), updatedAt: daysAgo(1), unit: { code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1 } },
  { id: "i2", unitId: "u3", code: 1002, type: "INCIDENT", title: "Cortocircuito en cocina", description: "Chispas al enchufar electrodomésticos. Hay olor a quemado.", priority: "URGENT", status: "IN_PROGRESS", assignedTo: "Electricista García", slaHours: 4, slaRemaining: "SLA: 1h restante", progressPercent: 65, createdAt: daysAgo(0.5), updatedAt: daysAgo(0.2), unit: { code: "5C", label: "5C - T.B", tower: "Torre B", floor: 5 } },
  { id: "i3", unitId: "u3", code: 1003, type: "COMPLAINT", title: "Ruidos molestos desde piso 6", description: "Música alta y golpes constantes desde las 22hs.", priority: "NORMAL", status: "OPEN", slaHours: 48, createdAt: daysAgo(2), updatedAt: daysAgo(2), unit: { code: "5C", label: "5C - T.B", tower: "Torre B", floor: 5 } },
  { id: "i4", unitId: "u5", code: 1004, type: "MAINTENANCE", title: "Puerta del balcón no cierra", description: "El herraje está roto, no cierra correctamente.", priority: "HIGH", status: "OPEN", slaHours: 24, slaRemaining: "SLA: 6h restantes", createdAt: daysAgo(3), updatedAt: daysAgo(3), unit: { code: "10B", label: "10B - T.B", tower: "Torre B", floor: 10 } },
  { id: "i5", unitId: "u2", code: 1005, type: "MAINTENANCE", title: "Aire acondicionado sin frío", description: "El equipo enciende pero no enfría.", priority: "NORMAL", status: "RESOLVED", assignedTo: "Técnico Frío", slaHours: 48, resolvedAt: daysAgo(1), createdAt: daysAgo(5), updatedAt: daysAgo(1), unit: { code: "2B", label: "2B - T.A", tower: "Torre A", floor: 2 } },
  { id: "i6", unitId: "u4", code: 1006, type: "INCIDENT", title: "Filtración en techo", description: "Mancha de humedad visible en el techo del living.", priority: "URGENT", status: "IN_PROGRESS", assignedTo: "Albañil Rodríguez", slaHours: 8, slaRemaining: "SLA: 2h restantes", progressPercent: 40, createdAt: daysAgo(0.3), updatedAt: daysAgo(0.1), unit: { code: "8A", label: "8A - T.A", tower: "Torre A", floor: 8 } },
  { id: "i7", unitId: "u7", code: 1007, type: "MAINTENANCE", title: "Persiana trabada", description: "La persiana del dormitorio principal no sube.", priority: "LOW", status: "CLOSED", slaHours: 72, resolvedAt: daysAgo(7), createdAt: daysAgo(14), updatedAt: daysAgo(7), unit: { code: "15C", label: "15C - T.C", tower: "Torre C", floor: 15 } },
];

// ── Move Requests ──────────────────────────────────────────────────────────
export const MOCK_MOVES: MoveRequest[] = [
  { id: "mv1", unitId: "u1", date: futureDays(5), startHour: "09:00", endHour: "14:00", type: "MOVE_OUT", company: "Mudanzas Express", status: "APPROVED", notes: "Empresa autorizada", unit: { code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1 } },
  { id: "mv2", unitId: "u6", date: futureDays(10), startHour: "08:00", endHour: "17:00", type: "MOVE_IN", company: "FlexMove S.A.", status: "PENDING", unit: { code: "12A", label: "12A - T.A", tower: "Torre A", floor: 12 } },
  { id: "mv3", unitId: "u3", date: daysAgo(30), startHour: "10:00", endHour: "16:00", type: "MOVE_IN", company: "Mudanzas del Sur", status: "COMPLETED", unit: { code: "5C", label: "5C - T.B", tower: "Torre B", floor: 5 } },
  { id: "mv4", unitId: "u5", date: daysAgo(60), startHour: "09:00", endHour: "13:00", type: "MOVE_IN", status: "COMPLETED", unit: { code: "10B", label: "10B - T.B", tower: "Torre B", floor: 10 } },
];

// ── Notifications ──────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Encomienda recibida — 1A T.A", body: "Recibimos un paquete de Andreani. Retíralo en portería.", type: "PACKAGE", createdAt: daysAgo(0.1), readAt: null },
  { id: "n2", title: "Visita en portería — 8A T.A", body: "Juan Pérez solicita acceso. Autorizado por Valentina López.", type: "ACCESS", createdAt: daysAgo(0.08), readAt: null },
  { id: "n3", title: "Incidente urgente — 5C T.B", body: "Cortocircuito en cocina. Técnico asignado.", type: "INCIDENT", createdAt: daysAgo(0.5), readAt: null },
  { id: "n4", title: "Reserva confirmada — 8A T.A", body: "Parrilla Norte reservada para el viernes 19:00–23:00.", type: "RESERVATION", createdAt: daysAgo(1), readAt: daysAgo(0.9) },
  { id: "n5", title: "Expensa vencida — 10B T.B", body: "La expensa de Septiembre está vencida. Saldo: $85.000.", type: "EXPENSE", createdAt: daysAgo(2), readAt: null },
  { id: "n6", title: "Mudanza aprobada — 1A T.A", body: "Mudanza el 17/09 de 09:00 a 14:00 aprobada por administración.", type: "MOVE", createdAt: daysAgo(3), readAt: daysAgo(2) },
  { id: "n7", title: "Aviso del edificio", body: "El miércoles 13/09 se realizará mantenimiento de ascensores entre las 10:00 y las 14:00.", type: "ANNOUNCEMENT", createdAt: daysAgo(4), readAt: null },
  { id: "n8", title: "Encomienda recibida — 15C T.C", body: "Paquete FedEx en portería esperando retiro.", type: "PACKAGE", createdAt: daysAgo(0.5), readAt: daysAgo(0.4) },
];

// ── Expenses ───────────────────────────────────────────────────────────────
export const MOCK_EXPENSES_DATA: ExpensesData = {
  expenses: [
    { id: "e1", unitId: "u1", buildingId: "b1", period: "2024-09", amount: 42500, status: "PAID", paidAmount: 42500, dueDate: futureDays(5), paidAt: daysAgo(2), method: "TRANSFER", createdAt: daysAgo(15), updatedAt: daysAgo(2), unit: { id: "u1", code: "1A", label: "1A - T.A", tower: "Torre A", floor: 1, residents: [{ fullName: "Martín Guzmán", avatarColor: "#6366f1" }] } },
    { id: "e2", unitId: "u2", buildingId: "b1", period: "2024-09", amount: 42500, status: "OVERDUE", paidAmount: 0, dueDate: daysAgo(5), createdAt: daysAgo(15), updatedAt: daysAgo(15), unit: { id: "u2", code: "2B", label: "2B - T.A", tower: "Torre A", floor: 2, residents: [{ fullName: "Ana Fernández", avatarColor: "#06b6d4" }] } },
    { id: "e3", unitId: "u3", buildingId: "b1", period: "2024-09", amount: 42500, status: "PENDING", paidAmount: 0, dueDate: futureDays(10), createdAt: daysAgo(15), updatedAt: daysAgo(15), unit: { id: "u3", code: "5C", label: "5C - T.B", tower: "Torre B", floor: 5, residents: [{ fullName: "Carlos Ruiz", avatarColor: "#34d399" }] } },
    { id: "e4", unitId: "u4", buildingId: "b1", period: "2024-09", amount: 42500, status: "PAID", paidAmount: 42500, dueDate: futureDays(10), paidAt: daysAgo(3), method: "MERCADOPAGO", createdAt: daysAgo(15), updatedAt: daysAgo(3), unit: { id: "u4", code: "8A", label: "8A - T.A", tower: "Torre A", floor: 8, residents: [{ fullName: "Valentina López", avatarColor: "#fbbf24" }] } },
    { id: "e5", unitId: "u5", buildingId: "b1", period: "2024-09", amount: 42500, status: "OVERDUE", paidAmount: 0, dueDate: daysAgo(10), createdAt: daysAgo(15), updatedAt: daysAgo(15), unit: { id: "u5", code: "10B", label: "10B - T.B", tower: "Torre B", floor: 10, residents: [{ fullName: "Diego Morales", avatarColor: "#f43f5e" }] } },
    { id: "e6", unitId: "u6", buildingId: "b1", period: "2024-09", amount: 42500, status: "OVERDUE", paidAmount: 0, dueDate: daysAgo(15), createdAt: daysAgo(15), updatedAt: daysAgo(15), unit: { id: "u6", code: "12A", label: "12A - T.A", tower: "Torre A", floor: 12, residents: [{ fullName: "Sofía Pérez", avatarColor: "#c0c1ff" }] } },
    { id: "e7", unitId: "u7", buildingId: "b1", period: "2024-09", amount: 42500, status: "PARTIAL", paidAmount: 20000, dueDate: futureDays(5), createdAt: daysAgo(15), updatedAt: daysAgo(5), unit: { id: "u7", code: "15C", label: "15C - T.C", tower: "Torre C", floor: 15, residents: [{ fullName: "Facundo Torres", avatarColor: "#4cd7f6" }] } },
    { id: "e8", unitId: "u8", buildingId: "b1", period: "2024-09", amount: 42500, status: "PAID", paidAmount: 42500, dueDate: futureDays(10), paidAt: daysAgo(1), method: "CASH", createdAt: daysAgo(15), updatedAt: daysAgo(1), unit: { id: "u8", code: "18PH", label: "PH - T.A", tower: "Torre A", floor: 18, residents: [] } },
  ],
  summary: { total: 340000, collected: 190000, pending: 42500, overdue: 127500, collectionRate: 56, count: 8 },
  byPeriod: [
    { period: "2024-09", total: 340000, collected: 190000, pending: 42500, count: 8, paid: 3, overdue: 3, partial: 1, rate: 56 },
    { period: "2024-08", total: 340000, collected: 297500, pending: 0, count: 8, paid: 7, overdue: 0, partial: 1, rate: 87 },
  ],
};

export const MOCK_EXPENSE_TRENDS: ExpenseTrends = {
  months: [
    { period: "2024-04", label: "Abril",      total: 280000, collected: 252000, pending: 28000, rate: 90, count: 8, overdue: 0 },
    { period: "2024-05", label: "Mayo",       total: 295000, collected: 265500, pending: 29500, rate: 90, count: 8, overdue: 0 },
    { period: "2024-06", label: "Junio",      total: 310000, collected: 263500, pending: 46500, rate: 85, count: 8, overdue: 1 },
    { period: "2024-07", label: "Julio",      total: 320000, collected: 294400, pending: 25600, rate: 92, count: 8, overdue: 0 },
    { period: "2024-08", label: "Agosto",     total: 340000, collected: 297500, pending: 0,     rate: 87, count: 8, overdue: 0 },
    { period: "2024-09", label: "Septiembre", total: 340000, collected: 190000, pending: 42500, rate: 56, count: 8, overdue: 3 },
  ],
};

// ── Dashboard Stats ────────────────────────────────────────────────────────
export const MOCK_STATS: DashboardStats = {
  kpis: {
    unitsCount: 72,
    occupiedUnits: 65,
    occupancyRate: 90,
    pendingPackages: 6,
    insideVisitors: 3,
    openIncidents: 4,
    inProgressIncidents: 2,
    activeReservations: 3,
    pendingMoves: 1,
    unreadNotifs: 5,
  },
  monthly: { packages: 48, accesses: 312, reservations: 24, incidents: 11 },
  weeks: [
    { label: "Sem 1", visits: 42, packages: 11, maintenance: 2 },
    { label: "Sem 2", visits: 38, packages: 14, maintenance: 3 },
    { label: "Sem 3", visits: 51, packages: 9,  maintenance: 4 },
    { label: "Sem 4", visits: 45, packages: 14, maintenance: 2 },
  ],
  expenses: { total: 340000, collected: 190000, pending: 42500, overdue: 127500, rate: 56, period: "2024-09", count: 8 },
  recent: {
    packages: MOCK_PACKAGES.slice(0, 4) as any,
    accesses: MOCK_ACCESSES.slice(0, 4) as any,
    incidents: MOCK_INCIDENTS.slice(0, 4) as any,
    reservations: MOCK_RESERVATIONS.slice(0, 4) as any,
  },
};

// ── Delay helper (simula latencia) ─────────────────────────────────────────
export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
