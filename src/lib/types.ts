export interface Observation {
  id: string;
  type: 'note' | 'defect' | 'downtime';
  reason: string;
  detail: string;
  timestamp: number;
}

export interface FunctionEntry {
  id: string;
  name: string;
  description: string;
  worker: string;
  pieces: number;
  observations: Observation[];
  checklists: string[];
}

export interface Day {
  id: string;
  name: string;
  date: string; // ISO string
  functions: FunctionEntry[];
}

export interface AppState {
  days: Day[];
}
