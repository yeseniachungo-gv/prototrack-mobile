"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState, Day, FunctionEntry, Observation, HistoryEntry } from '@/lib/types';
import {produce} from 'immer';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_ACTIVE_DAY'; payload: string }
  | { type: 'ADD_DAY'; payload: { dayId: string } }
  | { type: 'DELETE_DAY'; payload: { dayId: string } }
  | { type: 'RENAME_DAY'; payload: { dayId: string, newId: string, newName: string } }
  | { type: 'ADD_FUNCTION'; payload: { dayId: string; name: string } }
  | { type: 'DELETE_FUNCTION'; payload: { functionId: string } }
  | { type: 'UPDATE_FUNCTION'; payload: { dayId: string, functionData: FunctionEntry } }
  | { type: 'UPDATE_OBSERVATION'; payload: { dayId: string, functionId: string, observation: Observation } }
  | { type: 'ADD_HISTORY_ENTRY'; payload: { dayId: string; entry: HistoryEntry } }
  | { type: 'CLEAR_HISTORY'; payload: { dayId: string } }
  | { type: 'TOGGLE_THEME' };


const APP_STATE_KEY = 'prototrack-state';

const makeHourRange = (start: number, end: number) => {
  const hours = [];
  for(let h=start; h<end; h++){
    hours.push(String(h).padStart(2,'0') + ':00');
  }
  return hours;
};

function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error("Failed to parse state from localStorage", e);
      }
    }
  }

  // Seed data if no saved state
  const today = new Date().toISOString().split('T')[0];
  
  return {
    days: [{
      id: today,
      name: `Dia ${today}`,
      date: new Date().toISOString(),
      functions: [{
        id: crypto.randomUUID(),
        name: 'Costura',
        description: '',
        workers: ['Maria', 'João'],
        hours: makeHourRange(8, 18),
        observations: [],
        checklists: [],
      },
      {
        id: crypto.randomUUID(),
        name: 'Embalagem',
        description: '',
        workers: ['Ana', 'Carlos'],
        hours: makeHourRange(8, 18),
        observations: [],
        checklists: [],
      }],
      history: [],
    }],
    activeDayId: today,
    theme: 'dark',
  };
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  return produce(state, draft => {
      switch (action.type) {
        case 'SET_STATE':
          return action.payload;

        case 'TOGGLE_THEME':
          draft.theme = draft.theme === 'dark' ? 'light' : 'dark';
          break;

        case 'SET_ACTIVE_DAY':
          draft.activeDayId = action.payload;
          break;
        
        case 'ADD_DAY': {
            const { dayId } = action.payload;
            draft.days.push({
                id: dayId,
                name: `Dia ${dayId}`,
                date: new Date(dayId).toISOString(),
                functions: [],
                history: [],
            });
            draft.activeDayId = dayId;
            break;
        }

        case 'ADD_FUNCTION': {
            const day = draft.days.find(d => d.id === action.payload.dayId);
            if(day) {
                day.functions.push({
                    id: crypto.randomUUID(),
                    name: action.payload.name,
                    description: '',
                    workers: ['Operador 1', 'Operador 2', 'Operador 3'],
                    hours: makeHourRange(8, 18), // Default 8:00 to 17:00
                    observations: [],
                    checklists: [],
                });
            }
            break;
        }

        case 'DELETE_FUNCTION': {
             const day = draft.days.find(d => d.id === draft.activeDayId);
             if(day) {
                day.functions = day.functions.filter(f => f.id !== action.payload.functionId);
             }
             break;
        }
        
        case 'UPDATE_FUNCTION': {
            const day = draft.days.find(d => d.id === action.payload.dayId);
            if(day) {
                const funcIndex = day.functions.findIndex(f => f.id === action.payload.functionData.id);
                if(funcIndex !== -1) {
                    day.functions[funcIndex] = action.payload.functionData;
                }
            }
            break;
        }

        case 'UPDATE_OBSERVATION': {
          const { dayId, functionId, observation } = action.payload;
          const day = draft.days.find(d => d.id === dayId);
          if (day) {
            const func = day.functions.find(f => f.id === functionId);
            if (func) {
              const obsIndex = func.observations.findIndex(o => o.id === observation.id);
              if (obsIndex !== -1) {
                // Ensure values are numbers
                const pieces = Number(observation.pieces) || 0;
                const duration = Number(observation.duration) || 0;
                func.observations[obsIndex] = {...observation, pieces, duration};
              } else {
                func.observations.push(observation);
              }
            }
          }
          break;
        }

        case 'ADD_HISTORY_ENTRY': {
            const { dayId, entry } = action.payload;
            const day = draft.days.find(d => d.id === dayId);
            if(day) {
                day.history.unshift(entry);
                if (day.history.length > 25) {
                    day.history.pop();
                }
            }
            break;
        }

        case 'CLEAR_HISTORY': {
             const { dayId } = action.payload;
             const day = draft.days.find(d => d.id === dayId);
             if(day) {
                day.history = [];
             }
             break;
        }

        default:
          break;
      }
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  useEffect(() => {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
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
