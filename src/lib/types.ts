export interface Observation {
  reason: string;
  detail: string;
}

export interface FunctionEntry {
  id: string;
  name: string;
  workers: string[];
  hours: string[];
  pieces: { [workerId_hour: string]: number };
  observations: { [workerId_hour: string]: Observation };
}

export interface Day {
  id: string; // ISO Date string 'YYYY-MM-DD'
  functions: FunctionEntry[];
}

export interface StopwatchHistoryEntry {
    id: string;
    endTime: string; // ISO string
    duration: number; // in seconds
    pieces: number;
}

export interface StopwatchState {
    time: number;
    pieces: number;
    isRunning: boolean;
    history: StopwatchHistoryEntry[];
}

export interface AppState {
  days: Day[];
  activeDayId: string | null;
  theme: 'light' | 'dark';
  stopwatch: StopwatchState;
}
