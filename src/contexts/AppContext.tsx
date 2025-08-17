// src/contexts/AppContext.tsx
"use client";

import React, { createContext, useReducer, useContext, useEffect, useRef } from 'react';
import { produce } from 'immer';
import type { AppState, Day, FunctionEntry, Profile, Announcement, StopwatchState, MasterDataItem, StopwatchHistoryEntry, Plan } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type Action =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_STATE', payload: AppState }
  | { type: 'SET_PLAN', payload: Plan }
  | { type: 'ADD_DAY' }
  | { type: 'CLONE_DAY', payload: { sourceDayId: string } }
  | { type: 'SET_ACTIVE_DAY', payload: string }
  | { type: 'ADD_FUNCTION', payload: { dayId: string; functionName: string } }
  | { type: 'DELETE_FUNCTION', payload: { dayId: string; functionId: string } }
  | { type: 'ADD_WORKER_TO_FUNCTION', payload: { dayId: string; functionId: string; workerName: string } }
  | { type: 'DELETE_WORKER_FROM_FUNCTION', payload: { dayId: string; functionId: string; workerName: string } }
  | { type: 'ADD_HOUR_TO_FUNCTION', payload: { dayId: string; functionId: string } }
  | { type: 'DELETE_HOUR_FROM_FUNCTION', payload: { dayId: string; functionId: string; hour: string } }
  | { type: 'UPDATE_PIECES', payload: { dayId: string; functionId: string; worker: string; hour: string; value: number } }
  | { type: 'UPDATE_OBSERVATION', payload: { dayId: string; functionId: string; worker: string; hour: string; reason: string; detail: string; minutesStopped?: number } }
  | { type: 'UPDATE_DAILY_GOAL', payload: { goal: number; functionId: string | null } }
  | { type: 'ADD_PROFILE'; payload: string }
  | { type: 'DELETE_PROFILE'; payload: string }
  | { type: 'SET_ACTIVE_PROFILE'; payload: string | null }
  | { type: 'SET_CURRENT_PROFILE_FOR_LOGIN'; payload: string | null }
  | { type: 'UPDATE_PROFILE_DETAILS', payload: { profileId: string; name: string; pin: string } }
  | { type: 'ADD_ANNOUNCEMENT', payload: { content: string } }
  | { type: 'ADD_MASTER_DATA'; payload: { type: 'workers' | 'reasons'; name: string } }
  | { type: 'EDIT_MASTER_DATA', payload: { type: 'workers' | 'reasons'; id: string; newName: string } }
  | { type: 'DELETE_MASTER_DATA'; payload: { type: 'workers' | 'reasons'; id: string } }
  // Stopwatch actions now need profileId
  | { type: 'SET_TIMER', payload: { profileId: string, seconds: number } }
  | { type: 'START_TIMER', payload: { profileId: string } }
  | { type: 'STOP_TIMER', payload: { profileId: string } }
  | { type: 'RESET_TIMER', payload: { profileId: string } }
  | { type: 'TICK', payload: { profileId: string } }
  | { type: 'ADD_PIECE', payload: { profileId: string, amount: number } }
  | { type: 'UNDO_PIECE', payload: { profileId: string } }
  | { type: 'SET_STOPWATCH_MODE', payload: { profileId: string, mode: 'countdown' | 'countup' } }
  | { type: 'CLEAR_STOPWATCH_HISTORY', payload: { profileId: string } }
  | { type: 'UPDATE_STOPWATCH_STATE', payload: { profileId: string, stopwatchState: StopwatchState } };


const APP_STATE_KEY = 'giratempo-state-v4-multi-stopwatch';

const createDefaultStopwatchState = (): StopwatchState => ({
    mode: 'countdown',
    time: 15,
    initialTime: 15,
    pieces: 0,
    isRunning: false,
    session: {
      operator: '',
      functionName: '',
      auxiliaryTimePercent: 8.3,
    },
    history: []
});

const createDefaultProfile = (name: string): Profile => {
    const today = new Date().toISOString().split('T')[0];
    const defaultHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    
    return {
        id: uuidv4(),
        name,
        pin: "1234",
        days: [{
            id: today,
            functions: [{
                id: uuidv4(),
                name: "Função Exemplo",
                workers: ['Trabalhador 1', 'Trabalhador 2', 'Trabalhador 3'],
                hours: defaultHours,
                pieces: {},
                observations: {}
            }]
        }],
        activeDayId: today,
        dailyGoal: {
            target: 5000,
            functionId: null,
        },
        masterWorkers: [
            { id: uuidv4(), name: 'Trabalhador 1'},
            { id: uuidv4(), name: 'Trabalhador 2'},
            { id: uuidv4(), name: 'Trabalhador 3'},
        ],
        masterStopReasons: [
            { id: uuidv4(), name: 'Troca de função' },
            { id: uuidv4(), name: 'Treinamento' },
            { id: uuidv4(), name: 'Manutenção de máquina' },
            { id: uuidv4(), name: 'Pausa prolongada' },
            { id: uuidv4(), name: 'Outro' },
        ],
        stopwatch: createDefaultStopwatchState()
    };
};

function getInitialState(): AppState {
  return {
    plan: 'premium',
    profiles: [createDefaultProfile('Perfil Padrão')],
    activeProfileId: null, 
    currentProfileForLogin: null,
    theme: 'dark',
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
    
    // Helper to save stopwatch history to the correct profile
    const saveStopwatchHistory = (profile: Profile) => {
        const { session, mode, initialTime, time, pieces } = profile.stopwatch;
        
        // Duration for PPH is the total standard time for countdowns, or final elapsed time for countups.
        const calculationDuration = mode === 'countdown' && initialTime > 0 ? initialTime : time;

        // Actual elapsed time
        const actualDuration = mode === 'countdown' ? initialTime - time : time;
        
        if (actualDuration > 0 || pieces > 0) {
            const pph = calculationDuration > 0 ? (pieces / calculationDuration) * 3600 : 0;
            const adjustedPieces = pieces * (1 - (session.auxiliaryTimePercent / 100));
            const adjustedPph = calculationDuration > 0 ? (adjustedPieces / calculationDuration) * 3600 : 0;

            const newEntry: StopwatchHistoryEntry = {
                id: uuidv4(),
                endTime: new Date().toISOString(),
                duration: actualDuration,
                pieces,
                workerName: session.operator,
                functionName: session.functionName,
                averagePerHour: pph,
                auxiliaryTimePercent: session.auxiliaryTimePercent,
                adjustedAveragePerHour: adjustedPph,
            };
            profile.stopwatch.history.unshift(newEntry);
        }
    };
    
    switch (action.type) {
        case 'SET_STATE': {
            return action.payload;
        }

        case 'TOGGLE_THEME': {
            draft.theme = draft.theme === 'dark' ? 'light' : 'dark';
            break;
        }

        case 'SET_PLAN': {
            draft.plan = action.payload;
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
        case 'UPDATE_STOPWATCH_STATE': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && !profile.stopwatch.isRunning) {
                profile.stopwatch = action.payload.stopwatchState;
            }
            break;
        }
        case 'SET_STOPWATCH_MODE': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && !profile.stopwatch.isRunning) {
                profile.stopwatch.mode = action.payload.mode;
                profile.stopwatch.pieces = 0;
                profile.stopwatch.time = action.payload.mode === 'countdown' ? profile.stopwatch.initialTime : 0;
            }
            break;
        }
        case 'SET_TIMER': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && !profile.stopwatch.isRunning) {
                if (profile.stopwatch.mode === 'countdown') {
                    profile.stopwatch.initialTime = action.payload.seconds;
                    profile.stopwatch.time = action.payload.seconds;
                }
            }
            break;
        }
        case 'START_TIMER': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && !profile.stopwatch.isRunning) {
                profile.stopwatch.isRunning = true;
                if (profile.stopwatch.mode === 'countup') {
                    profile.stopwatch.time = 0;
                    profile.stopwatch.pieces = 0;
                }
            }
            break;
        }
        case 'STOP_TIMER': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && profile.stopwatch.isRunning) {
                profile.stopwatch.isRunning = false;
                saveStopwatchHistory(profile);
            }
            break;
        }
        case 'RESET_TIMER': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && !profile.stopwatch.isRunning) {
                profile.stopwatch.pieces = 0;
                profile.stopwatch.time = profile.stopwatch.mode === 'countdown' ? profile.stopwatch.initialTime : 0;
            }
            break;
        }
        case 'ADD_PIECE': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && profile.stopwatch.isRunning) {
                profile.stopwatch.pieces += action.payload.amount;
            }
            break;
        }
        case 'UNDO_PIECE': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && profile.stopwatch.pieces > 0) {
                profile.stopwatch.pieces -= 1;
            }
            break;
        }
        case 'TICK': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile && profile.stopwatch.isRunning) {
                 if (profile.stopwatch.mode === 'countdown') {
                    profile.stopwatch.time -= 1;
                    if (profile.stopwatch.time <= 0) {
                        profile.stopwatch.time = 0;
                        profile.stopwatch.isRunning = false;
                        saveStopwatchHistory(profile);
                    }
                } else { // countup
                    profile.stopwatch.time += 1;
                }
            }
            break;
        }
        case 'CLEAR_STOPWATCH_HISTORY': {
            const profile = draft.profiles.find(p => p.id === action.payload.profileId);
            if (profile) {
                profile.stopwatch.history = [];
            }
            break;
        }

        // --- Production Data Actions (need active profile) ---
        default: {
            const activeProfile = draft.profiles.find(p => p.id === draft.activeProfileId);
            if (!activeProfile) break;

            switch(action.type) {
                case 'EDIT_MASTER_DATA': {
                    const { type, id, newName } = action.payload;
                    const list = type === 'workers' ? activeProfile.masterWorkers : activeProfile.masterStopReasons;
                    const item = list.find(i => i.id === id);
                    if (item) {
                        const oldName = item.name;
                        item.name = newName;
                        
                        // Propagate name change throughout the profile's data
                        if (type === 'workers') {
                            activeProfile.days.forEach(day => {
                                day.functions.forEach(func => {
                                    // Update worker in the function's worker list
                                    const workerIndex = func.workers.indexOf(oldName);
                                    if (workerIndex > -1) {
                                        func.workers[workerIndex] = newName;
                                    }
                                    
                                    // Update keys in pieces and observations objects
                                    const updateKeys = (obj: any) => {
                                        Object.keys(obj).forEach(key => {
                                            if (key.startsWith(`${oldName}_`)) {
                                                const newKey = key.replace(`${oldName}_`, `${newName}_`);
                                                obj[newKey] = obj[key];
                                                delete obj[key];
                                            }
                                        });
                                    };
                                    updateKeys(func.pieces);
                                    updateKeys(func.observations);
                                });
                            });
                             // Update stopwatch history
                            activeProfile.stopwatch.history.forEach(entry => {
                                if (entry.workerName === oldName) {
                                    entry.workerName = newName;
                                }
                            });
                            // Update current stopwatch session
                            if(activeProfile.stopwatch.session.operator === oldName) {
                                activeProfile.stopwatch.session.operator = newName;
                            }
                        } else { // type === 'reasons'
                             activeProfile.days.forEach(day => {
                                day.functions.forEach(func => {
                                     Object.values(func.observations).forEach(obs => {
                                        if (obs.reason === oldName) {
                                            obs.reason = newName;
                                        }
                                     });
                                });
                            });
                        }
                    }
                    break;
                }
                case 'ADD_MASTER_DATA': {
                    const { type, name } = action.payload;
                    const targetList = type === 'workers' ? activeProfile.masterWorkers : activeProfile.masterStopReasons;
                    if (name.trim() && !targetList.find(i => i.name.toLowerCase() === name.trim().toLowerCase())) {
                        targetList.push({ id: uuidv4(), name: name.trim() });
                    }
                    break;
                }
                case 'DELETE_MASTER_DATA': {
                    const { type, id } = action.payload;
                    // Note: This only deletes from the master list. It does not cascade delete data.
                    // This is intentional to preserve historical data integrity.
                    if (type === 'workers') {
                        activeProfile.masterWorkers = activeProfile.masterWorkers.filter(i => i.id !== id);
                    } else {
                        activeProfile.masterStopReasons = activeProfile.masterStopReasons.filter(i => i.id !== id);
                    }
                    break;
                }
                case 'SET_ACTIVE_DAY': {
                    if (activeProfile.days.find(d => d.id === action.payload)) {
                        activeProfile.activeDayId = action.payload;
                    }
                    break;
                }
                case 'ADD_DAY': {
                    const lastDayInState = activeProfile.days.length > 0 
                        ? activeProfile.days.reduce((latest, day) => new Date(day.id) > new Date(latest.id) ? day : latest)
                        : null;

                    let newDayId: string;
                    let functionsTemplate: FunctionEntry[] = [];
                    
                    if (lastDayInState) {
                        const nextDay = new Date(lastDayInState.id + 'T00:00:00');
                        nextDay.setDate(nextDay.getDate() + 1);
                        newDayId = nextDay.toISOString().split('T')[0];
                        
                        functionsTemplate = JSON.parse(JSON.stringify(lastDayInState.functions));
                        functionsTemplate.forEach((func) => {
                            func.id = uuidv4();
                            func.pieces = {};
                            func.observations = {};
                        });
                        activeProfile.dailyGoal = { ...activeProfile.dailyGoal };
                    } else {
                        newDayId = new Date().toISOString().split('T')[0];
                        const defaultHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
                        functionsTemplate = [{
                            id: uuidv4(),
                            name: "Função Exemplo",
                            workers: ['Trabalhador 1'],
                            hours: defaultHours,
                            pieces: {},
                            observations: {}
                        }];
                    }

                    if (!activeProfile.days.find(d => d.id === newDayId)) {
                        const newDay: Day = { id: newDayId, functions: functionsTemplate };
                        activeProfile.days.push(newDay);
                        activeProfile.days.sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());
                        activeProfile.activeDayId = newDayId;
                    }
                    break;
                }
                case 'CLONE_DAY': {
                    const { sourceDayId } = action.payload;
                    const sourceDay = activeProfile.days.find(d => d.id === sourceDayId);
                    
                    if (sourceDay) {
                        const todayId = new Date().toISOString().split('T')[0];
                        let targetDay = activeProfile.days.find(d => d.id === todayId);
                        
                        const clonedFunctions: FunctionEntry[] = JSON.parse(JSON.stringify(sourceDay.functions));
                        clonedFunctions.forEach(func => {
                            func.id = uuidv4();
                            func.pieces = {};
                            func.observations = {};
                        });

                        if (targetDay) {
                            targetDay.functions = clonedFunctions;
                        } else {
                            targetDay = { id: todayId, functions: clonedFunctions };
                            activeProfile.days.push(targetDay);
                        }
                        
                        activeProfile.days.sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());
                        activeProfile.activeDayId = todayId;
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
                                activeDay.functions.push({
                                    id: uuidv4(), name: payload.functionName, hours: defaultHours, workers: [], pieces: {}, observations: {},
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
        savedState.profiles.forEach((p: Profile) => {
          if (!p.id) p.id = uuidv4();
          if (!p.pin) p.pin = '1234';
          if (!p.masterWorkers) p.masterWorkers = createDefaultProfile('').masterWorkers;
          if (!p.masterStopReasons) p.masterStopReasons = createDefaultProfile('').masterStopReasons;
          if (!p.stopwatch) p.stopwatch = createDefaultStopwatchState();
          
          p.stopwatch.isRunning = false;
          p.stopwatch.time = p.stopwatch.mode === 'countdown' ? p.stopwatch.initialTime : 0;
          p.stopwatch.pieces = 0;
        });

        savedState.activeProfileId = null;
        savedState.currentProfileForLogin = null;
        if (!savedState.announcements) savedState.announcements = [];
        
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
        const stateToSave = JSON.parse(JSON.stringify(state));
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
    const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);

    if (activeProfile?.stopwatch.isRunning) {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK', payload: { profileId: activeProfile.id } }), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) };
  }, [state.activeProfileId, state.profiles]);
  
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
