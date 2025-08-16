export interface Observation {
  id: string;
  type: 'note' | 'defect' | 'downtime';
  reason: string;
  detail: string;
  timestamp: number;
  worker: string;
  hour: string;
  pieces?: number;
}

export interface FunctionEntry {
  id: string;
  name: string;
  description: string;
  worker: string;
  observations: Observation[];
  checklists: string[];
  // New fields from core.js
  workers: string[];
  hours: string[];
}

export interface Day {
  id: string;
  name:string;
  date: string; // ISO string
  functions: FunctionEntry[];
}

export interface AppState {
  days: Day[];
  activeDayId: string | null;
}
