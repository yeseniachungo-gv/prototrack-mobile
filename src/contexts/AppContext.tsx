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


const APP_STATE_KEY = 'prototrack-state-v2';

const makeHourRange = (start: number, end: number) => {
  const hours = [];
  for(let h=start; h<=end; h++){
    hours.push(String(h).padStart(2,'0') + ':00');
  }
  return hours;
};

function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Basic validation to prevent app crash on bad state
        if (parsedState.days && parsedState.activeDayId) {
          return parsedState;
        }
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
      name: `Dia ${today.slice(5).split('-').reverse().join('/')}`,
      date: new Date().toISOString(),
      functions: [],
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
            if (draft.days.find(d => d.id === dayId)) {
                break; // Do nothing if day already exists
            }
            const formattedDate = dayId.slice(5).split('-').reverse().join('/');
            draft.days.push({
                id: dayId,
                name: `Dia ${formattedDate}`,
                date: new Date(dayId + 'T00:00:00').toISOString(),
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
                    workers: ['Trabalhador 1'],
                    hours: makeHourRange(8, 17),
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
              const obsIndex = func.observations.findIndex(o => o.worker === observation.worker && o.hour === observation.hour);
              if (obsIndex !== -1) {
                // Ensure values are numbers
                const pieces = Number(observation.pieces) || 0;
                const duration = Number(observation.duration) || 0;
                func.observations[obsIndex] = {...func.observations[obsIndex], ...observation, pieces, duration};
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

  useEffect(() => {
    // This effect runs on the client and handles the theme class on the html element
    const isDark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [state.theme]);

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
