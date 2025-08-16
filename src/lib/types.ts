export interface Observation {
  id: string;
  type: 'note' | 'defect' | 'downtime'; // Type might be simplified from original
  reason: string;
  detail: string;
  timestamp: number;
  worker: string;
  hour: string;
  pieces: number; // No longer optional
}

export interface FunctionEntry {
  id: string;
  name: string;
  description: string;
  // worker field is deprecated in favor of workers array
  workers: string[];
  hours: string[];
  observations: Observation[]; // Replaces the 'cells' map from core.js
  // checklists field from previous state
  checklists: string[];
}

export interface Day {
  id: string; // ISO Date string 'YYYY-MM-DD'
  name: string; // User-friendly name, e.g., "Dia de Teste"
  date: string; // ISO string
  functions: FunctionEntry[];
}

export interface AppState {
  days: Day[];
  activeDayId: string | null;
}

export interface TimerState {
  running: boolean;
  startedAt: number | null;
  elapsedSec: number;
  pieces: number;
  history: TimerHistoryEntry[];
}

export interface TimerHistoryEntry {
  start: number;
  end: number;
  elapsedSec: number;
  pieces: number;
}
