
export interface Observation {
  reason: string;
  detail: string;
  minutesStopped?: number;
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
    workerName: string;
    functionName: string;
    auxiliaryTimePercent: number;
    averagePerHour: number;
    adjustedAveragePerHour: number;
}

export interface StopwatchState {
    mode: 'countdown' | 'countup';
    time: number; // Represents the current time on the stopwatch (countdown or countup)
    initialTime: number; // The starting time for the countdown
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

    