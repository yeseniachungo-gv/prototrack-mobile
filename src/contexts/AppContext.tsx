"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState, Day, FunctionEntry } from '@/lib/types';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_ACTIVE_DAY', payload: string }
  | { type: 'ADD_DAY'; payload: Day }
  | { type: 'UPDATE_DAY'; payload: Day }
  | { type: 'DELETE_DAY'; payload: { dayId: string } }
  | { type: 'CLONE_DAY'; payload: { dayId: string } }
  | { type: 'ADD_FUNCTION'; payload: { dayId: string; functionData: Omit<FunctionEntry, 'pieces' | 'observations'> & { workers: string[], hours: string[] } } }
  | { type: 'UPDATE_FUNCTION'; payload: { dayId: string; functionData: FunctionEntry } }
  | { type: 'DELETE_FUNCTION'; payload: { dayId: string; functionId: string } };

const initialState: AppState = {
  days: [],
  activeDayId: null,
};

function getInitialState(): AppState {
    if (typeof window === 'undefined') {
        return initialState;
    }
    try {
        const storedState = localStorage.getItem('protoTrackState');
        if (storedState) {
            const parsedState = JSON.parse(storedState);
            if (!parsedState.activeDayId && parsedState.days.length > 0) {
                parsedState.activeDayId = parsedState.days[0].id;
            }
            return parsedState;
        }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
    }

    // Seed initial state if none exists
    const dayId = crypto.randomUUID();
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
                worker: 'Default',
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
                worker: 'Default',
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
    case 'ADD_DAY': {
      return { ...state, days: [...state.days, action.payload] };
    }
    case 'UPDATE_DAY': {
        return {
            ...state,
            days: state.days.map(day => day.id === action.payload.id ? action.payload : day)
        };
    }
    case 'DELETE_DAY': {
      const newDays = state.days.filter((day) => day.id !== action.payload.dayId);
      let newActiveDayId = state.activeDayId;
      if (state.activeDayId === action.payload.dayId) {
          newActiveDayId = newDays.length > 0 ? newDays[0].id : null;
      }
      return {
        ...state,
        days: newDays,
        activeDayId: newActiveDayId,
      };
    }
    case 'CLONE_DAY': {
        const dayToClone = state.days.find(day => day.id === action.payload.dayId);
        if (!dayToClone) return state;
        const clonedDay: Day = {
            ...dayToClone,
            id: crypto.randomUUID(),
            name: `${dayToClone.name} (Cópia)`,
            date: new Date().toISOString(),
            functions: dayToClone.functions.map(f => ({...f, id: crypto.randomUUID()}))
        };
        const newDays = [...state.days, clonedDay];
        return { ...state, days: newDays, activeDayId: clonedDay.id };
    }
    case 'ADD_FUNCTION': {
        const newFunction: FunctionEntry = {
            ...action.payload.functionData,
            id: crypto.randomUUID(),
            pieces: 0,
            observations: [],
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
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem('protoTrackState', JSON.stringify(state));
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
