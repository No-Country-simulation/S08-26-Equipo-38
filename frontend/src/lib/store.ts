// src/lib/store.ts — Zustand store (adaptado de modelo1, sin view/setView → React Router maneja URLs)
import { create } from "zustand";
import type { Building, Role } from "./types";

const STORAGE_KEY = "condotrack-prefs";

function loadPrefs(): { selectedBuildingId?: string | null; role?: Role } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: { selectedBuildingId?: string | null; role?: Role }) {
  try {
    const existing = loadPrefs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch {
    /* ignore */
  }
}

const initialPrefs = loadPrefs();

interface AppState {
  // context
  buildings: Building[];
  setBuildings: (b: Building[]) => void;
  selectedBuildingId: string | null;
  setSelectedBuilding: (id: string | null) => void;

  role: Role;
  setRole: (r: Role) => void;

  // resident unit binding — when role is RESIDENT, this is the unit they "own"
  residentUnitId: string | null;
  setResidentUnitId: (id: string | null) => void;

  // selected unit for vista360
  selectedUnitId: string | null;
  setSelectedUnit: (id: string | null) => void;

  // command palette
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;

  // notifications panel
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;

  // mobile sidebar drawer
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useApp = create<AppState>((set) => ({
  buildings: [],
  setBuildings: (buildings) => set({ buildings }),
  selectedBuildingId: initialPrefs.selectedBuildingId ?? null,
  setSelectedBuilding: (selectedBuildingId) => {
    set({ selectedBuildingId });
    savePrefs({ selectedBuildingId });
  },

  role: initialPrefs.role ?? "ADMIN",
  setRole: (role) => {
    set({ role });
    savePrefs({ role });
  },

  residentUnitId: null,
  setResidentUnitId: (residentUnitId) => set({ residentUnitId }),

  selectedUnitId: null,
  setSelectedUnit: (selectedUnitId) => set({ selectedUnitId }),

  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),

  notifOpen: false,
  setNotifOpen: (notifOpen) => set({ notifOpen }),

  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
}));
