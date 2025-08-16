"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState, Day, FunctionEntry, Observation } from '@/lib/types';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_ACTIVE_DAY'; payload: string }
  | { type: 'ADD_DAY'; payload: Day }
  | { type: 'UPDATE_DAY'; payload: Day }
  | { type: 'DELETE_DAY'; payload: { dayId: string } }
  | { type: 'CLONE_DAY'; payload: { dayId: string, withData: boolean } }
  | { type: 'ADD_FUNCTION'; payload: { dayId: string; functionData: Omit<FunctionEntry, 'id' | 'observations' | 'checklists'> } }
  | { type: 'UPDATE_FUNCTION'; payload: { dayId: string; functionData: FunctionEntry } }
  | { type: 'DELETE_FUNCTION'; payload: { dayId: string; functionId: string } }
  | { type: 'UPDATE_OBSERVATION'; payload: { dayId: string; functionId: string; observation: Observation } };


function getInitialState(): AppState {
  if (typeof window === 'undefined') {
    return { days: [], activeDayId: null };
  }
  try {
    const storedState = localStorage.getItem('gt:v2:default:state');
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      // Compatibility fix from user's core.js (days was an object)
      if (!Array.isArray(parsedState.days)) {
        parsedState.days = Object.entries(parsedState.days).map(([id, dayData]: [string, any]) => ({
          ...dayData,
          id: id,
          date: new Date(id).toISOString(),
          name: dayData.name || `Dia ${id}`,
           functions: (dayData.functions || []).map((func: any) => ({
              ...func,
              observations: Object.entries(func.cells || {}).map(([key, cell]: [string, any]) => {
                  const [worker, hour] = key.split('@');
                  return {
                      id: crypto.randomUUID(),
                      type: 'note',
                      worker,
                      hour,
                      pieces: cell.pieces || 0,
                      reason: cell.obs?.reason || '',
                      detail: cell.obs?.detail || '',
                      timestamp: new Date().getTime(),
                  };
              })
           }))
        }));
      }
      if (!parsedState.activeDayId && parsedState.days.length > 0) {
        parsedState.activeDayId = parsedState.days[0].id;
      }
      return parsedState;
    }
  } catch (error) {
    console.error("Failed to load state from localStorage", error);
  }

  // Seed initial state if none exists
  const dayId = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const seededState: AppState = {
    activeDayId: dayId,
    days: [{
      id: dayId,
      name: "Dia de Teste",
      date: new Date().toISOString(),
      functions: [{
        id: crypto.randomUUID(),
        name: 'Costura',
        description: '',
        checklists: [],
        workers: ['Maria', 'João'],
        hours: ['08:00', '09:00', '10:00', '11:00'],
        observations: [
          { id: crypto.randomUUID(), type: 'note', reason: '', detail: '', timestamp: Date.now(), worker: 'Maria', hour: '08:00', pieces: 15 },
          { id: crypto.randomUUID(), type: 'note', reason: '', detail: '', timestamp: Date.now(), worker: 'João', hour: '08:00', pieces: 12 },
        ],
      }, {
        id: crypto.randomUUID(),
        name: 'Embalagem',
        description: '',
        checklists: [],
        workers: ['Ana', 'Carlos'],
        hours: ['08:00', '09:00', '10:00', '11:00'],
        observations: [
          { id: crypto.randomUUID(), type: 'note', reason: 'Troca de função', detail: 'Iniciando', timestamp: Date.now(), worker: 'Ana', hour: '09:00', pieces: 20 },
        ],
      }]
    }]
  };
  return seededState;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'SET_ACTIVE_DAY':
        return { ...state, activeDayId: action.payload };
    case 'ADD_DAY':
      return { ...state, days: [...state.days, action.payload] };
    case 'UPDATE_DAY':
      return {
        ...state,
        days: state.days.map(day => day.id === action.payload.id ? action.payload : day)
      };
    case 'DELETE_DAY': {
      if (state.days.length <= 1) return state; // Cannot delete the last day
      const newDays = state.days.filter((day) => day.id !== action.payload.dayId);
      let newActiveDayId = state.activeDayId;
      if (state.activeDayId === action.payload.dayId) {
          newActiveDayId = newDays.length > 0 ? newDays[newDays.length - 1].id : null;
      }
      return { ...state, days: newDays, activeDayId: newActiveDayId };
    }
    case 'CLONE_DAY': {
      const dayToClone = state.days.find(day => day.id === action.payload.dayId);
      if (!dayToClone) return state;

      const allDays = state.days.map(d => d.id).sort();
      const lastDay = allDays[allDays.length-1];
      const nextDate = new Date(lastDay);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      const newDayId = nextDate.toISOString().split('T')[0];

      const clonedDay: Day = {
        id: newDayId,
        name: `Cópia de ${dayToClone.name}`,
        date: new Date(newDayId).toISOString(),
        functions: dayToClone.functions.map(f => ({
          ...f,
          id: crypto.randomUUID(),
          // if cloning with data, keep observations, otherwise clear them
          observations: action.payload.withData ? JSON.parse(JSON.stringify(f.observations)) : [],
        }))
      };
      const newDays = [...state.days, clonedDay];
      return { ...state, days: newDays, activeDayId: clonedDay.id };
    }
    case 'ADD_FUNCTION': {
      const newFunction: FunctionEntry = {
        ...action.payload.functionData,
        id: crypto.randomUUID(),
        observations: [],
        checklists: [],
        description: '',
      };
      return {
        ...state,
        days: state.days.map(day =>
          day.id === action.payload.dayId
          ? { ...day, functions: [...day.functions, newFunction] }
          : day
        ),
      };
    }
    case 'UPDATE_FUNCTION': {
      return {
        ...state,
        days: state.days.map(day =>
          day.id === action.payload.dayId
          ? { ...day, functions: day.functions.map(func => func.id === action.payload.functionData.id ? action.payload.functionData : func) }
          : day
        )
      };
    }
    case 'DELETE_FUNCTION': {
      return {
        ...state,
        days: state.days.map(day =>
          day.id === action.payload.dayId
          ? { ...day, functions: day.functions.filter(func => func.id !== action.payload.functionId) }
          : day
        )
      };
    }
    case 'UPDATE_OBSERVATION': {
      return {
        ...state,
        days: state.days.map(day => {
          if (day.id !== action.payload.dayId) return day;
          return {
            ...day,
            functions: day.functions.map(func => {
              if (func.id !== action.payload.functionId) return func;
              
              const obsIndex = func.observations.findIndex(
                obs => obs.worker === action.payload.observation.worker && obs.hour === action.payload.observation.hour
              );

              let newObservations = [...func.observations];
              if (obsIndex > -1) {
                newObservations[obsIndex] = action.payload.observation;
              } else {
                newObservations.push(action.payload.observation);
              }
              return { ...func, observations: newObservations };
            })
          };
        })
      };
    }
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  useEffect(() => {
    try {
      // Logic from user's core.js
      const st = {
        activeDay: state.activeDayId,
        days: state.days.reduce((acc, day) => {
          acc[day.id] = {
            ...day,
            functions: (day.functions || []).map(f => ({
              ...f,
              cells: f.observations.reduce((cellAcc, obs) => {
                cellAcc[`${obs.worker}@${obs.hour}`] = {
                  pieces: obs.pieces,
                  obs: { reason: obs.reason, detail: obs.detail }
                };
                return cellAcc;
              }, {} as any)
            }))
          };
          return acc;
        }, {} as any)
      };

      localStorage.setItem('gt:v2:default:state', JSON.stringify(st));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
