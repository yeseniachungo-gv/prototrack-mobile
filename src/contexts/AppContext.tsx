"use client";

import React, { createContext, useReducer, useContext, useEffect, useRef } from 'react';
import { produce } from 'immer';
import type { AppState, Day, FunctionEntry, Observation, StopwatchState } from '@/lib/types';
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
  | { type: 'UPDATE_OBSERVATION', payload: { dayId: string; functionId: string; worker: string; hour: string; reason: string; detail: string } }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'ADD_PIECE', payload: number };


const APP_STATE_KEY = 'prototrack-state-v2';

function getInitialState(): AppState {
  const today = new Date().toISOString().split('T')[0];
  const defaultHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
  const defaultWorkers = Array.from({ length: 3 }, (_, i) => `Trabalhador ${i + 1}`);

  return {
    days: [{ 
      id: today, 
      functions: [
        {
          id: uuidv4(),
          name: "Função Exemplo",
          workers: defaultWorkers,
          hours: defaultHours,
          pieces: {},
          observations: {}
        }
      ] 
    }],
    activeDayId: today,
    theme: 'dark',
    stopwatch: {
        time: 0,
        pieces: 0,
        isRunning: false,
        history: []
    }
  };
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeDay: Day | null;
} | undefined>(undefined);


const appReducer = (state: AppState, action: Action): AppState => {
  return produce(state, draft => {
    // Ações que não dependem de um dia ativo
    switch (action.type) {
      case 'TOGGLE_THEME':
        draft.theme = draft.theme === 'dark' ? 'light' : 'dark';
        return;
      case 'SET_STATE':
        // Ao restaurar, mantém o histórico do cronômetro local, se houver
        const localStopwatchHistory = draft.stopwatch.history;
        const restoredState = action.payload;
        restoredState.stopwatch = getInitialState().stopwatch;
        restoredState.stopwatch.history = localStopwatchHistory;
        return restoredState;
      case 'SET_ACTIVE_DAY':
        if (draft.days.find(d => d.id === action.payload)) {
          draft.activeDayId = action.payload;
        }
        return;
      case 'ADD_DAY': {
        const lastDayInState = draft.days.reduce((latest, day) => new Date(day.id) > new Date(latest.id) ? day : latest, draft.days[0]);
        const nextDay = new Date(lastDayInState.id + 'T00:00:00');
        nextDay.setDate(nextDay.getDate() + 1);
        const newDayId = nextDay.toISOString().split('T')[0];
        
        if (!draft.days.find(d => d.id === newDayId)) {
          const functionsTemplate: FunctionEntry[] = JSON.parse(JSON.stringify(lastDayInState.functions));
          functionsTemplate.forEach((func) => {
            func.pieces = {};
            func.observations = {};
          });
          
          const newDay: Day = { id: newDayId, functions: functionsTemplate };
          draft.days.push(newDay);
          draft.days.sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime());
          draft.activeDayId = newDayId;
        }
        return;
      }
      // Ações do Cronômetro
      case 'TOGGLE_TIMER':
          draft.stopwatch.isRunning = !draft.stopwatch.isRunning;
          if (!draft.stopwatch.isRunning && draft.stopwatch.time > 0) {
              // Adicionar ao histórico quando o timer para
              draft.stopwatch.history.unshift({
                  id: uuidv4(),
                  endTime: new Date().toISOString(),
                  duration: draft.stopwatch.time,
                  pieces: draft.stopwatch.pieces
              });
              // Resetar para a próxima medição
              draft.stopwatch.time = 0;
              draft.stopwatch.pieces = 0;
          }
          return;
      case 'RESET_TIMER':
          draft.stopwatch.isRunning = false;
          draft.stopwatch.time = 0;
          draft.stopwatch.pieces = 0;
          return;
      case 'ADD_PIECE':
          if (draft.stopwatch.isRunning) {
              draft.stopwatch.pieces += action.payload;
          }
          return;
      case 'TICK':
          if (draft.stopwatch.isRunning) {
              draft.stopwatch.time += 1;
          }
          return;
    }

    // Ações que OPERAM sobre um dia (e possivelmente uma função)
    const day = draft.days.find(d => d.id === draft.activeDayId);
    if (day) {
        const { payload } = action as any; 
        const func = payload?.functionId ? day.functions.find(f => f.id === payload.functionId) : undefined;
        
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
                    // Remove a hora
                    func.hours = func.hours.filter(h => h !== payload.hour);
                    // Remove dados associados a essa hora
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
                    if (!payload.reason && !payload.detail) {
                        delete func.observations[key];
                    } else {
                        func.observations[key] = {
                            reason: payload.reason,
                            detail: payload.detail
                        };
                    }
                }
                break;
        }
    }
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
        savedState.stopwatch = getInitialState().stopwatch; // Cronômetro não persiste
        return savedState;
      }
    } catch (e) {
      console.error("Falha ao carregar o estado, usando o estado inicial.", e);
    }
    return getInitialState();
  });
  
  const [isInitialized, setIsInitialized] = React.useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Efeito para carregar o estado apenas no cliente
  useEffect(() => {
    setIsInitialized(true);
  }, []);


  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    if (isInitialized) {
      try {
        const stateToSave = { ...state };
        // Não salva o estado em tempo real do cronômetro, apenas o histórico
        const stopwatchStateToSave = { history: state.stopwatch.history };
        (stateToSave as any).stopwatch = stopwatchStateToSave;
        
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.error("Falha ao salvar o estado.", e)
      }
    }
  }, [state, isInitialized]);
  
  // Efeito para o tema
  useEffect(() => {
    if (isInitialized) {
      const isDark = state.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('light', !isDark);
    }
  }, [state.theme, isInitialized]);
  
  // Efeito para o timer do cronômetro
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

  const activeDay = state.days.find(d => d.id === state.activeDayId) || null;

  if (!isInitialized) {
    return null; // ou um componente de loading
  }

  return (
    <AppContext.Provider value={{ state, dispatch, activeDay }}>
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
