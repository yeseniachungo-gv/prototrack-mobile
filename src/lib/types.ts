export interface Observation {
  id: string;
  type: 'note' | 'defect' | 'downtime'; 
  reason: string;
  detail: string;
  timestamp: number;
  worker: string;
  hour: string;
  pieces: number;
  duration: number; // for downtime
}

export interface FunctionEntry {
  id: string;
  name: string;
  description: string;
  workers: string[];
  hours: string[];
  observations: Observation[];
  checklists: string[];
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  operator: string;
  func: string;
  interval: number;
  pieces: number;
  rate: number;
  adjRate: number;
  lossPercent: number;
}

export interface Day {
  id: string; // ISO Date string 'YYYY-MM-DD'
  name: string; // User-friendly name, e.g., "Dia de Teste"
  date: string; // ISO string
  functions: FunctionEntry[];
  history: HistoryEntry[];
}

export interface AppState {
  days: Day[];
  activeDayId: string | null;
  theme: 'light' | 'dark';
}
