
"use client";

import React, { createContext, useReducer, useContext, useEffect, useRef } from 'react';
import { produce } from 'immer';
import type { AppState, Day, FunctionEntry, Observation, StopwatchState, Profile } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type Action =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_STATE', payload: AppState }
  | { type: 'ADD_DAY' }
  | { type: 'SET_ACTIVE_DAY', payload: string }
  | { type: 'ADD_FUNCTION', payload: { dayId: string; functionName: string } }
  | { type: 'DELETE_FUNCTION', payload: { dayId: string; functionId: string } }
  | { type: 'RENAME_FUNCTION', payload: { dayId: string; functionId: string; newName: string } }
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
  | { type: 'UPDATE_PROFILE_DETAILS', payload: { profileId: string; name: string; pin: string } };


const APP_STATE_KEY = 'prototrack-state-v3';

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
  };
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeProfile: Profile | null;
  activeDay: Day | null;
} | undefined>(undefined);


// --- Reducer principal que delega para sub-reducers ---
const appReducer = (state: AppState, action: Action): AppState => {
    // Sub-reducer para o cronômetro
    const stopwatchReducer = (draft: AppState, action: Action) => {
        switch (action.type) {
            case 'SET_STOPWATCH_MODE':
                draft.stopwatch.isRunning = false;
                draft.stopwatch.pieces = 0;
                draft.stopwatch.mode = action.payload;
                if (action.payload === 'countdown') {
                    draft.stopwatch.time = draft.stopwatch.initialTime;
                } else {
                    draft.stopwatch.time = 0;
                }
                return;
            case 'SET_TIMER':
                if (!draft.stopwatch.isRunning && draft.stopwatch.mode === 'countdown') {
                    draft.stopwatch.initialTime = action.payload;
                    draft.stopwatch.time = action.payload;
                }
                return;
            case 'TOGGLE_TIMER': {
                const { operator, functionName, auxiliaryTimePercent } = action.payload;
                const wasRunning = draft.stopwatch.isRunning;

                if (wasRunning) {
                    draft.stopwatch.isRunning = false;
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
                    }
                    draft.stopwatch.pieces = 0;

                } else {
                    draft.stopwatch.isRunning = true;
                }
                return;
            }
            case 'RESET_TIMER':
                draft.stopwatch.isRunning = false;
                if (draft.stopwatch.mode === 'countdown') {
                    draft.stopwatch.time = draft.stopwatch.initialTime;
                } else {
                    draft.stopwatch.time = 0;
                }
                draft.stopwatch.pieces = 0;
                return;
            case 'ADD_PIECE':
                if (draft.stopwatch.isRunning) {
                    draft.stopwatch.pieces += action.payload;
                }
                return;
            case 'TICK':
                if (draft.stopwatch.isRunning) {
                    if (draft.stopwatch.mode === 'countdown') {
                        if (draft.stopwatch.time > 0) {
                            draft.stopwatch.time -= 1;
                        }
                        if (draft.stopwatch.time === 0) {
                            draft.stopwatch.isRunning = false;
                        }
                    } else { // countup
                        draft.stopwatch.time += 1;
                    }
                }
                return;
        }
    }

    // Sub-reducer para perfis
    const profileReducer = (draft: AppState, action: Action) => {
        const activeProfile = draft.profiles.find(p => p.id === draft.activeProfileId);
        
        switch(action.type) {
            case 'ADD_PROFILE':
                if (!draft.profiles.find(p => p.name.toLowerCase() === action.payload.toLowerCase())) {
                    const newProfile = createDefaultProfile(action.payload);
                    draft.profiles.push(newProfile);
                    draft.activeProfileId = newProfile.id;
                }
                return;
            case 'DELETE_PROFILE':
                if (draft.profiles.length > 1) {
                    const profileIndex = draft.profiles.findIndex(p => p.id === action.payload);
                    if (profileIndex > -1) {
                        draft.profiles.splice(profileIndex, 1);
                        if (draft.activeProfileId === action.payload) {
                            draft.activeProfileId = null;
                        }
                    }
                }
                return;
            case 'SET_ACTIVE_PROFILE':
                draft.activeProfileId = action.payload;
                draft.currentProfileForLogin = null;
                return;
            case 'SET_CURRENT_PROFILE_FOR_LOGIN':
                 draft.currentProfileForLogin = action.payload;
                 return;
            case 'UPDATE_PROFILE_DETAILS':
                const profileToUpdate = draft.profiles.find(p => p.id === action.payload.profileId);
                if (profileToUpdate) {
                    profileToUpdate.name = action.payload.name;
                    profileToUpdate.pin = action.payload.pin;
                }
                return;
        }
        
        if (!activeProfile) return;

        switch(action.type) {
             case 'SET_ACTIVE_DAY':
                if (activeProfile.days.find(d => d.id === action.payload)) {
                    activeProfile.activeDayId = action.payload;
                }
                return;
            case 'ADD_DAY': {
                if (activeProfile.days.length === 0) {
                    const today = new Date().toISOString().split('T')[0];
                    activeProfile.days.push({ id: today, functions: [] });
                    activeProfile.activeDayId = today;
                    return;
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
                return;
            }
            case 'UPDATE_DAILY_GOAL':
                activeProfile.dailyGoal.target = action.payload.goal;
                activeProfile.dailyGoal.functionId = action.payload.functionId;
                return;
        }

        const day = activeProfile.days.find(d => d.id === activeProfile.activeDayId);
        if (day) {
            const { payload } = action as any; 
            let func: FunctionEntry | undefined;
            if (payload?.functionId) {
                func = day.functions.find(f => f.id === payload.functionId)
            }
            
            switch (action.type) {
                case 'ADD_FUNCTION':
                    if (!day.functions.find(f => f.name.toLowerCase() === payload.functionName.toLowerCase())) {
                        const defaultHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
                        const defaultWorkers = Array.from({ length: 3 }, (_, i) => `Trabalhador ${i + 1}`);
                        day.functions.push({
                            id: uuidv4(),
                            name: payload.functionName,
                            hours: defaultHours,
                            workers: defaultWorkers,
                            pieces: {},
                            observations: {},
                        });
                    }
                    break;
                case 'DELETE_FUNCTION':
                    day.functions = day.functions.filter(f => f.id !== payload.functionId);
                    break;
                case 'RENAME_FUNCTION':
                    if (func) func.name = payload.newName;
                    break;
                case 'ADD_WORKER_TO_FUNCTION':
                    if (func && !func.workers.find(w => w.toLowerCase() === payload.workerName.toLowerCase())) {
                       if (payload.workerName.trim()){
                         func.workers.push(payload.workerName.trim());
                       }
                    }
                    break;
                case 'DELETE_WORKER_FROM_FUNCTION':
                    if (func) {
                        func.workers = func.workers.filter(w => w !== payload.workerName);
                        Object.keys(func.pieces).forEach(key => {
                          if (key.startsWith(`${payload.workerName}_`)) delete func.pieces[key];
                        });
                         Object.keys(func.observations).forEach(key => {
                          if (key.startsWith(`${payload.workerName}_`)) delete func.observations[key];
                        });
                    }
                    break;
                case 'ADD_HOUR_TO_FUNCTION':
                    if (func) {
                        const lastHourStr = func.hours.length > 0 ? func.hours[func.hours.length - 1] : "07:00";
                        const lastHour = parseInt(lastHourStr.split(':')[0]);
                        const newHour = (lastHour + 1) % 24;
                        const newHourStr = `${String(newHour).padStart(2, '0')}:00`;
                        if (!func.hours.includes(newHourStr)) {
                           func.hours.push(newHourStr);
                           func.hours.sort();
                        }
                    }
                    break;
                case 'DELETE_HOUR_FROM_FUNCTION':
                    if (func) {
                        func.hours = func.hours.filter(h => h !== payload.hour);
                        Object.keys(func.pieces).forEach(key => {
                            if (key.endsWith(`_${payload.hour}`)) delete func.pieces[key];
                        });
                        Object.keys(func.observations).forEach(key => {
                            if (key.endsWith(`_${payload.hour}`)) delete func.observations[key];
                        });
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
                            func.observations[key] = {
                                reason: payload.reason,
                                detail: payload.detail,
                                minutesStopped: payload.minutesStopped
                            };
                        }
                    }
                    break;
            }
        }
    }

    return produce(state, draft => {
        // Ações que não dependem de um perfil ativo
        switch (action.type) {
            case 'TOGGLE_THEME':
                draft.theme = draft.theme === 'dark' ? 'light' : 'dark';
                return;
            case 'SET_STATE': {
                const localStopwatchHistory = draft.stopwatch.history;
                const restoredState = action.payload;

                if (!restoredState.profiles) {
                    const defaultProfile = createDefaultProfile('Perfil Restaurado');
                    defaultProfile.days = (restoredState as any).days || [];
                    defaultProfile.activeDayId = (restoredState as any).activeDayId || null;
                    defaultProfile.dailyGoal = (restoredState as any).dailyGoal || getInitialState().profiles[0].dailyGoal;

                    restoredState.profiles = [defaultProfile];
                    restoredState.activeProfileId = defaultProfile.id;
                    delete (restoredState as any).days;
                    delete (restoredState as any).activeDayId;
                    delete (restoredState as any).dailyGoal;
                }

                restoredState.stopwatch = getInitialState().stopwatch;
                restoredState.stopwatch.history = localStopwatchHistory;
                return restoredState;
            }
        }

        // Delega para os sub-reducers
        profileReducer(draft, action);
        stopwatchReducer(draft, action);
    });
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }
    try {
      const savedStateString = localStorage.getItem(APP_STATE_KEY);
      if (savedStateString) {
        const savedState = JSON.parse(savedStateString);
        
        // --- Migração e Validação do Estado ---
        if (!savedState.profiles || !Array.isArray(savedState.profiles)) {
            console.log("Migrando estado antigo para a nova estrutura de perfis.");
            const defaultProfile = createDefaultProfile('Perfil Padrão (Restaurado)');
            defaultProfile.days = (savedState as any).days || [];
            defaultProfile.activeDayId = (savedState as any).activeDayId || null;
            defaultProfile.dailyGoal = (savedState as any).dailyGoal || getInitialState().profiles[0].dailyGoal;
            
            savedState.profiles = [defaultProfile];
            delete (savedState as any).days;
            delete (savedState as any).activeDayId;
            delete (savedState as any).dailyGoal;
        }

        savedState.profiles.forEach((p: Profile) => {
          if (!p.pin) p.pin = '1234';
          if (!p.id) p.id = uuidv4();
        });
        
        // Garante que nenhum perfil esteja ativo ao iniciar
        savedState.activeProfileId = null;
        savedState.currentProfileForLogin = null;

        // Reseta o estado do cronômetro para evitar bugs
        const initialStopwatch = getInitialState().stopwatch;
        savedState.stopwatch = {
          ...initialStopwatch,
          history: savedState.stopwatch?.history || [],
          mode: savedState.stopwatch?.mode || 'countdown',
          initialTime: savedState.stopwatch?.initialTime || 15
        };
        savedState.stopwatch.isRunning = false;
        savedState.stopwatch.pieces = 0;
        savedState.stopwatch.time = savedState.stopwatch.mode === 'countdown' ? savedState.stopwatch.initialTime : 0;
        
        return savedState;
      }
    } catch (e) {
      console.error("Falha ao carregar o estado, usando o estado inicial.", e);
      localStorage.removeItem(APP_STATE_KEY); // Limpa o estado corrompido
    }
    return getInitialState();
  });
  
  const [isInitialized, setIsInitialized] = React.useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        const stateToSave = { ...state };
        // Não salvamos o estado 'isRunning' para evitar que o cronômetro comece sozinho
        const stopwatchStateToSave = {
            history: state.stopwatch.history,
            initialTime: state.stopwatch.initialTime,
            mode: state.stopwatch.mode,
        };
        (stateToSave as any).stopwatch = stopwatchStateToSave;
        
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.error("Falha ao salvar o estado.", e)
      }
    }
  }, [state, isInitialized]);
  
  useEffect(() => {
    if (isInitialized) {
      const isDark = state.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('light', !isDark);
    }
  }, [state.theme, isInitialized]);
  
  useEffect(() => {
    if (state.stopwatch.isRunning) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.stopwatch.isRunning]);
  
  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId) || null;
  const activeDay = activeProfile?.days.find(d => d.id === activeProfile.activeDayId) || null;

  if (!isInitialized) {
    return null; 
  }

  return (
    <AppContext.Provider value={{ state, dispatch, activeProfile, activeDay }}>
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
