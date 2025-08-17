// src/lib/types.ts

export type Plan = 'basic' | 'pro' | 'premium';

export interface Announcement {
  id: string;
  authorProfileId: string;
  authorName: string;
  content: string;
  timestamp: string; // ISO String
}

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
    averagePerHour: number;
    auxiliaryTimePercent: number;
    adjustedAveragePerHour: number;
}

export interface StopwatchSession {
    operator: string;
    functionName: string;
    auxiliaryTimePercent: number;
}

export interface StopwatchState {
    mode: 'countdown' | 'countup';
    time: number; // Represents the current time on the stopwatch (countdown or countup)
    initialTime: number; // The starting time for the countdown
    pieces: number;
    isRunning: boolean;
    session: StopwatchSession;
    history: StopwatchHistoryEntry[];
}

export interface DailyGoal {
  target: number;
  functionId: string | null;
}

export interface MasterDataItem {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  name:string;
  pin: string; // 4-digit PIN
  days: Day[];
  activeDayId: string | null;
  dailyGoal: DailyGoal;
  masterWorkers: MasterDataItem[];
  masterStopReasons: MasterDataItem[];
  stopwatch: StopwatchState;
}

export interface AppState {
  plan: Plan;
  profiles: Profile[];
  activeProfileId: string | null;
  currentProfileForLogin: string | null; // Used to know which profile is trying to log in
  theme: 'light' | 'dark';
  announcements: Announcement[];
}
