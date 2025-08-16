"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState, Day, FunctionEntry, Observation } from '@/lib/types';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_ACTIVE_DAY'; payload: string };

// A simplified state for the new prototype, we can remove most of the old complex logic.
const getInitialState = (): AppState => {
  const dayId = new Date().toISOString().split('T')[0];
  return {
    days: [{
        id: dayId,
        name: `Dia ${dayId}`,
        date: new Date().toISOString(),
        functions: [], // Functions are managed locally in the new page component
    }],
    activeDayId: dayId,
  };
};

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
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // We can simplify or remove the localStorage logic if the new prototype handles it differently.
  useEffect(() => {
    // console.log("State updated, but not saving to localStorage in this version.");
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
