"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState, Day, FunctionEntry } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// This is a workaround for uuid being a CJS module
const generateId = () => (typeof window !== 'undefined' ? uuidv4() : '');

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_DAY'; payload: { name: string; date: string } }
  | { type: 'UPDATE_DAY'; payload: Day }
  | { type: 'DELETE_DAY'; payload: { dayId: string } }
  | { type: 'CLONE_DAY'; payload: { dayId: string } }
  | { type: 'ADD_FUNCTION'; payload: { dayId: string; functionData: Omit<FunctionEntry, 'id' | 'pieces' | 'observations'> } }
  | { type: 'UPDATE_FUNCTION'; payload: { dayId: string; functionData: FunctionEntry } }
  | { type: 'DELETE_FUNCTION'; payload: { dayId: string; functionId: string } };


const initialState: AppState = {
  days: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADD_DAY': {
      const newDay: Day = {
        id: generateId(),
        name: action.payload.name,
        date: action.payload.date,
        functions: [],
      };
      return { ...state, days: [...state.days, newDay] };
    }
    case 'UPDATE_DAY': {
        return {
            ...state,
            days: state.days.map(day => day.id === action.payload.id ? action.payload : day)
        };
    }
    case 'DELETE_DAY': {
      return {
        ...state,
        days: state.days.filter((day) => day.id !== action.payload.dayId),
      };
    }
    case 'CLONE_DAY': {
        const dayToClone = state.days.find(day => day.id === action.payload.dayId);
        if (!dayToClone) return state;
        const clonedDay: Day = {
            ...dayToClone,
            id: generateId(),
            name: `${dayToClone.name} (Copy)`,
            date: new Date().toISOString(),
        };
        return { ...state, days: [...state.days, clonedDay] };
    }
    case 'ADD_FUNCTION': {
        const newFunction: FunctionEntry = {
            ...action.payload.functionData,
            id: generateId(),
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
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('protoTrackState');
      if (storedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(storedState) });
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

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
