// src/contexts/AppContext.tsx
"use client";

import React, { createContext, useReducer, useContext, useEffect, useRef } from 'react';
import { produce } from 'immer';
import type { AppState, Day, FunctionEntry, Profile, Announcement, StopwatchState } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type Action =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_STATE', payload: AppState }
  | { type: 'ADD_DAY' }
  | { type: 'SET_ACTIVE_DAY', payload: string }
  | { type: 'ADD_FUNCTION', payload: { dayId: string; functionName: string } }
  | { type: 'DELETE_FUNCTION', payload: { dayId: string; functionId: string } }
  | { type: 'ADD_WORKER_TO_FUNCTION', payload: { dayId: string; functionId: string; workerName: string } }
  | { type: 'DELETE_WORKER_FROM_FUNCTION', payload: { dayId: string; functionId: string; workerName: string } }
  | { type: 'ADD_HOUR_TO_FUNCTION', payload: { dayId: string; functionId: string } }
  | { type: 'DELETE_HOUR_FROM_FUNCTION', payload: { dayId: string; functionId: string; hour: string } }
  | { type: 'UPDATE_PIECES', payload: { dayId: string; functionId: string; worker: string; hour: string; value: number } }
  | { type: 'UPDATE_OBSERVATION', payload: { dayId: string; functionId: string; worker: string; hour: string; reason: string; detail: string; minutesStopped?: number } }
  | { type: 'SET_TIMER', payload: number }
  | { type: 'TOGGLE_TIMER', payload: { operator: string, functionName: string, auxiliaryTimePercent: number } }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'ADD_PIECE', payload: number }
  | { type: 'SET_STOPWATCH_MODE', payload: 'countdown' | 'countup' }
  | { type: 'UPDATE_DAILY_GOAL', payload: { goal: number; functionId: string | null } }
  | { type: 'ADD_PROFILE'; payload: string }
  | { type: 'DELETE_PROFILE'; payload: string }
  | { type: 'SET_ACTIVE_PROFILE'; payload: string | null }
  | { type: 'SET_CURRENT_PROFILE_FOR_LOGIN'; payload: string | null }
  | { type: 'UPDATE_PROFILE_DETAILS', payload: { profileId: string; name: string; pin: string } }
  | { type: 'ADD_ANNOUNCEMENT', payload: { content: string } };

const APP_STATE_KEY = 'giratempo-state-v1';

const createDefaultProfile = (name: string): Profile => {
    const today = new Date().toISOString().split('T')[0];
    const defaultHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    const defaultWorkers = Array.from({ length: 3 }, (_, i) => `Trabalhador ${i + 1}`);

    return {
        id: uuidv4(),
        name,
        pin: "1234",
        days: [{
            id: today,
            functions: [{
                id: uuidv4(),
                name: "Função Exemplo",
                workers: defaultWorkers,
                hours: defaultHours,
                pieces: {},
                observations: {}
            }]
        }],
        activeDayId: today,
        dailyGoal: {
            target: 5000,
            functionId: null,
        }
    };
};

function getInitialState(): AppState {
  return {
    profiles: [createDefaultProfile('Perfil Padrão')],
    activeProfileId: null, 
    currentProfileForLogin: null,
    theme: 'dark',
    stopwatch: {
        mode: 'countdown',
        time: 15,
        initialTime: 15,
        pieces: 0,
        isRunning: false,
        history: []
    },
    announcements: [],
  };
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeProfile: Profile | null;
  activeDay: Day | null;
} | undefined>(undefined);

const appReducer = produce((draft: AppState, action: Action) => {
    switch (action.type) {
        case 'SET_STATE': {
            return action.payload;
        }

        case 'TOGGLE_THEME': {
            draft.theme = draft.theme === 'dark' ? 'light' : 'dark';
            break;
        }

        // --- Profile Actions ---
        case 'ADD_PROFILE': {
            if (!draft.profiles.find(p => p.name.toLowerCase() === action.payload.toLowerCase())) {
                const newProfile = createDefaultProfile(action.payload);
                draft.profiles.push(newProfile);
            }
            break;
        }
        case 'DELETE_PROFILE': {
            if (draft.profiles.length > 1) {
                const profileIndex = draft.profiles.findIndex(p => p.id === action.payload);
                if (profileIndex > -1) {
                    draft.profiles.splice(profileIndex, 1);
                    if (draft.activeProfileId === action.payload) {
                        draft.activeProfileId = null;
                    }
                }
            }
            break;
        }
        case 'SET_ACTIVE_PROFILE': {
            draft.activeProfileId = action.payload;
            draft.currentProfileForLogin = null;
            break;
        }
        case 'SET_CURRENT_PROFILE_FOR_LOGIN': {
             draft.currentProfileForLogin = action.payload;
             break;
        }
        case 'UPDATE_PROFILE_DETAILS': {
            const profileToUpdate = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profileToUpdate) {
                profileToUpdate.name = action.payload.name;
                profileToUpdate.pin = action.payload.pin;
            }
            break;
        }

        // --- Announcement Actions ---
        case 'ADD_ANNOUNCEMENT': {
            const activeProfile = draft.profiles.find(p => p.id === draft.activeProfileId);
            if (activeProfile) {
              const newAnnouncement: Announcement = {
                id: uuidv4(),
                authorProfileId: activeProfile.id,
                authorName: activeProfile.name,
                content: action.payload.content,
                timestamp: new Date().toISOString(),
              };
              draft.announcements.unshift(newAnnouncement);
            }
            break;
        }

        // --- Stopwatch Actions ---
        case 'SET_STOPWATCH_MODE': {
            draft.stopwatch.isRunning = false;
            draft.stopwatch.pieces = 0;
            draft.stopwatch.mode = action.payload;
            draft.stopwatch.time = action.payload === 'countdown' ? draft.stopwatch.initialTime : 0;
            break;
        }
        case 'SET_TIMER': {
            if (!draft.stopwatch.isRunning && draft.stopwatch.mode === 'countdown') {
                draft.stopwatch.initialTime = action.payload;
                draft.stopwatch.time = action.payload;
            }
            break;
        }
        case 'TOGGLE_TIMER': {
            const { operator, functionName, auxiliaryTimePercent } = action.payload;
            const wasRunning = draft.stopwatch.isRunning;
            draft.stopwatch.isRunning = !wasRunning;

            if (wasRunning) { // When stopping
                const duration = draft.stopwatch.mode === 'countdown'
                    ? draft.stopwatch.initialTime - draft.stopwatch.time
                    : draft.stopwatch.time;
                
                if (duration > 0 || draft.stopwatch.pieces > 0) {
                    const pieces = draft.stopwatch.pieces;
                    const pph = duration > 0 ? (pieces / duration) * 3600 : 0;
                    const effectiveTimePercentage = 1 - (auxiliaryTimePercent / 100);
                    const adjustedPph = effectiveTimePercentage > 0 ? pph / effectiveTimePercentage : 0;

                    draft.stopwatch.history.unshift({
                        id: uuidv4(),
                        endTime: new Date().toISOString(),
                        duration: duration, 
                        pieces: pieces,
                        workerName: operator,
                        functionName: functionName,
                        auxiliaryTimePercent: auxiliaryTimePercent,
                        averagePerHour: pph,
                        adjustedAveragePerHour: adjustedPph,
                    });
                }
                if (draft.stopwatch.mode === 'countdown' && draft.stopwatch.time === 0) {
                     draft.stopwatch.time = draft.stopwatch.initialTime;
                     draft.stopwatch.pieces = 0;
                }
            }
            break;
        }
        case 'RESET_TIMER': {
            draft.stopwatch.isRunning = false;
            draft.stopwatch.pieces = 0;
            draft.stopwatch.time = draft.stopwatch.mode === 'countdown' ? draft.stopwatch.initialTime : 0;
            break;
        }
        case 'ADD_PIECE': {
            if (draft.stopwatch.isRunning) {
                draft.stopwatch.pieces += action.payload;
            }
            break;
        }
        case 'TICK': {
            if (draft.stopwatch.isRunning) {
                if (draft.stopwatch.mode === 'countdown') {
                    draft.stopwatch.time -= 1;
                    if (draft.stopwatch.time <= 0) {
                        draft.stopwatch.time = 0;
                        draft.stopwatch.isRunning = false; 
                    }
                } else { // countup
                    draft.stopwatch.time += 1;
                }
            }
            break;
        }

        // --- Production Data Actions (need active profile) ---
        default: {
            const activeProfile = draft.profiles.find(p => p.id === draft.activeProfileId);
            if (!activeProfile) break;

            switch(action.type) {
                case 'SET_ACTIVE_DAY': {
                    if (activeProfile.days.find(d => d.id === action.payload)) {
                        activeProfile.activeDayId = action.payload;
                    }
                    break;
                }
                case 'ADD_DAY': {
                    if (activeProfile.days.length === 0) {
                        const today = new Date().toISOString().split('T')[0];
                        activeProfile.days.push({ id: today, functions: [] });
                        activeProfile.activeDayId = today;
                        break;
                    }

                    const lastDayInState = activeProfile.days.reduce((latest, day) => new Date(day.id) > new Date(latest.id) ? day : latest, activeProfile.days[0]);
                    const nextDay = new Date(lastDayInState.id + 'T00:00:00');
                    nextDay.setDate(nextDay.getDate() + 1);
                    const newDayId = nextDay.toISOString().split('T')[0];

                    if (!activeProfile.days.find(d => d.id === newDayId)) {
                        const functionsTemplate: FunctionEntry[] = JSON.parse(JSON.stringify(lastDayInState.functions));
                        functionsTemplate.forEach((func) => {
                            func.id = uuidv4();
                            func.pieces = {};
                            func.observations = {};
                        });
                        
                        const newDay: Day = { id: newDayId, functions: functionsTemplate };
                        activeProfile.days.push(newDay);
                        activeProfile.days.sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());
                        activeProfile.activeDayId = newDayId;
                    }
                    break;
                }
                case 'UPDATE_DAILY_GOAL': {
                    activeProfile.dailyGoal.target = action.payload.goal;
                    activeProfile.dailyGoal.functionId = action.payload.functionId;
                    break;
                }
                default: {
                    const activeDay = activeProfile.days.find(d => d.id === activeProfile.activeDayId);
                    if (!activeDay) break;

                    const { payload } = action as any; 
                    const func = payload?.functionId ? activeDay.functions.find(f => f.id === payload.functionId) : undefined;
                    
                    if (!func && payload.functionId) break;

                    switch (action.type) {
                        case 'ADD_FUNCTION':
                            if (!activeDay.functions.find(f => f.name.toLowerCase() === payload.functionName.toLowerCase())) {
                                const defaultHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
                                const defaultWorkers = Array.from({ length: 3 }, (_, i) => `Trabalhador ${i + 1}`);
                                activeDay.functions.push({
                                    id: uuidv4(), name: payload.functionName, hours: defaultHours, workers: defaultWorkers, pieces: {}, observations: {},
                                });
                            }
                            break;
                        case 'DELETE_FUNCTION':
                            activeDay.functions = activeDay.functions.filter(f => f.id !== payload.functionId);
                            break;
                        case 'ADD_WORKER_TO_FUNCTION':
                            if (func && !func.workers.find(w => w.toLowerCase() === payload.workerName.toLowerCase())) {
                               if (payload.workerName.trim()){ func.workers.push(payload.workerName.trim()); }
                            }
                            break;
                        case 'DELETE_WORKER_FROM_FUNCTION':
                            if (func) {
                                func.workers = func.workers.filter(w => w !== payload.workerName);
                                Object.keys(func.pieces).forEach(key => { if (key.startsWith(`${payload.workerName}_`)) delete func.pieces[key]; });
                                Object.keys(func.observations).forEach(key => { if (key.startsWith(`${payload.workerName}_`)) delete func.observations[key]; });
                            }
                            break;
                        case 'ADD_HOUR_TO_FUNCTION':
                            if (func) {
                                const lastHourStr = func.hours.length > 0 ? func.hours[func.hours.length - 1] : "07:00";
                                const lastHour = parseInt(lastHourStr.split(':')[0]);
                                const newHour = (lastHour + 1) % 24;
                                const newHourStr = `${String(newHour).padStart(2, '0')}:00`;
                                if (!func.hours.includes(newHourStr)) { func.hours.push(newHourStr); func.hours.sort(); }
                            }
                            break;
                        case 'DELETE_HOUR_FROM_FUNCTION':
                            if (func) {
                                func.hours = func.hours.filter(h => h !== payload.hour);
                                Object.keys(func.pieces).forEach(key => { if (key.endsWith(`_${payload.hour}`)) delete func.pieces[key]; });
                                Object.keys(func.observations).forEach(key => { if (key.endsWith(`_${payload.hour}`)) delete func.observations[key]; });
                            }
                            break;
                        case 'UPDATE_PIECES':
                            if (func) {
                                const key = `${payload.worker}_${payload.hour}`;
                                func.pieces[key] = payload.value;
                            }
                            break;
                        case 'UPDATE_OBSERVATION':
                            if (func) {
                                const key = `${payload.worker}_${payload.hour}`;
                                if (!payload.reason && !payload.detail && (!payload.minutesStopped || payload.minutesStopped === 0)) {
                                    delete func.observations[key];
                                } else {
                                    func.observations[key] = { reason: payload.reason, detail: payload.detail, minutesStopped: payload.minutesStopped };
                                }
                            }
                            break;
                    }
                }
            }
        }
    }
});


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    if (typeof window === 'undefined') return getInitialState();
    try {
      const savedStateString = localStorage.getItem(APP_STATE_KEY);
      if (savedStateString) {
        const savedState = JSON.parse(savedStateString);
        
        // --- Migration & Validation ---
        if (!savedState.profiles || !Array.isArray(savedState.profiles)) {
            const defaultProfile = createDefaultProfile('Perfil Restaurado');
            defaultProfile.days = (savedState as any).days || [];
            savedState.profiles = [defaultProfile];
        }

        savedState.profiles.forEach((p: Profile) => {
          if (!p.pin) p.pin = '1234';
          if (!p.id) p.id = uuidv4();
        });
        
        savedState.activeProfileId = null;
        savedState.currentProfileForLogin = null;
        if (!savedState.announcements) savedState.announcements = [];

        // Reset stopwatch state to avoid bugs, keeping history
        const initialStopwatch = getInitialState().stopwatch;
        savedState.stopwatch = {
          ...initialStopwatch,
          history: savedState.stopwatch?.history || [],
          mode: savedState.stopwatch?.mode || 'countdown',
          initialTime: savedState.stopwatch?.initialTime || 15
        };
        savedState.stopwatch.isRunning = false; // Never start running on load
        savedState.stopwatch.pieces = 0;
        savedState.stopwatch.time = savedState.stopwatch.mode === 'countdown' ? savedState.stopwatch.initialTime : 0;
        
        return savedState;
      }
    } catch (e) {
      console.error("Failed to load state, using initial state.", e);
      localStorage.removeItem(APP_STATE_KEY);
    }
    return getInitialState();
  });
  
  const [isInitialized, setIsInitialized] = React.useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => setIsInitialized(true), []);

  useEffect(() => {
    if (isInitialized) {
      try {
        const stateToSave = { ...state };
        const stopwatchStateToSave = {
            history: state.stopwatch.history,
            initialTime: state.stopwatch.initialTime,
            mode: state.stopwatch.mode,
        };
        (stateToSave as any).stopwatch = stopwatchStateToSave;
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
      } catch (e) { console.error("Failed to save state.", e) }
    }
  }, [state, isInitialized]);
  
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
      document.documentElement.classList.toggle('light', state.theme === 'light');
    }
  }, [state.theme, isInitialized]);
  
  useEffect(() => {
    if (state.stopwatch.isRunning) {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) };
  }, [state.stopwatch.isRunning]);
  
  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId) || null;
  const activeDay = activeProfile?.days.find(d => d.id === activeProfile.activeDayId) || null;

  if (!isInitialized) return null; 

  return (
    <AppContext.Provider value={{ state, dispatch, activeProfile, activeDay }}>
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
