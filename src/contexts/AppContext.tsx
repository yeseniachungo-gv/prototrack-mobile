"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { produce } from 'immer';
import type { AppState, Day, FunctionEntry } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';


type Action =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_STATE', payload: AppState }
  | { type: 'ADD_DAY' }
  | { type: 'SET_ACTIVE_DAY', payload: string }
  | { type: 'ADD_FUNCTION', payload: { dayId: string; functionName: string } }
  | { type: 'OPEN_FUNCTION_SHEET', payload: { dayId: string, functionId: string } };

// --- Chave e Estado Inicial ---
const APP_STATE_KEY = 'prototrack-state-v2'; // Usamos v2 para garantir um estado limpo

function getInitialState(): AppState {
  // O estado inicial agora é carregado no AppProvider para garantir que o localStorage esteja disponível.
  // Retornamos um estado mínimo para evitar erros no lado do servidor.
  const today = new Date().toISOString().split('T')[0];
  return {
    days: [{ id: today, functions: [] }],
    activeDayId: today,
    theme: 'dark',
  };
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeDay: Day | null;
  selectedFunction: FunctionEntry | null;
} | undefined>(undefined);


// --- Reducer ---
const appReducer = (state: AppState, action: Action): AppState => {
  return produce(state, draft => {
    switch (action.type) {
      case 'TOGGLE_THEME':
        draft.theme = draft.theme === 'dark' ? 'light' : 'dark';
        break;

      case 'SET_STATE':
        return action.payload;

      case 'ADD_DAY': {
        const today = new Date();
        today.setDate(today.getDate() + draft.days.length); // Evita duplicatas simples
        const newDayId = today.toISOString().split('T')[0];

        if (!draft.days.find(d => d.id === newDayId)) {
          const lastDay = draft.days[draft.days.length - 1];
          const newDay: Day = {
            id: newDayId,
            functions: lastDay ? JSON.parse(JSON.stringify(lastDay.functions)) : [], // Clona estrutura
          };
          // Reseta os dados da estrutura clonada
          newDay.functions.forEach(func => {
            func.pieces = {};
            func.observations = {};
          });
          draft.days.push(newDay);
          draft.activeDayId = newDayId;
        }
        break;
      }
      
      case 'SET_ACTIVE_DAY':
        if (draft.days.find(d => d.id === action.payload)) {
          draft.activeDayId = action.payload;
        }
        break;
      
      case 'ADD_FUNCTION': {
        const { dayId, functionName } = action.payload;
        const day = draft.days.find(d => d.id === dayId);
        if (day && !day.functions.find(f => f.name === functionName)) {
          // Estrutura padrão para uma nova função
          const defaultHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
          const defaultWorkers = Array.from({ length: 3 }, (_, i) => `Trabalhador ${i + 1}`);

          day.functions.push({
            id: uuidv4(),
            name: functionName,
            hours: defaultHours,
            workers: defaultWorkers,
            pieces: {},
            observations: {},
          });
        }
        break;
      }
        
      // Ações para a planilha (serão adicionadas aqui)

      default:
        break;
    }
  });
};


// --- Provider ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Efeito para carregar o estado do localStorage apenas uma vez no cliente
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(APP_STATE_KEY);
      if (savedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(savedState) });
      }
    } catch (e) {
      console.error("Falha ao carregar o estado, usando o estado inicial.", e);
    }
    setIsInitialized(true);
  }, []);

  // Efeito para salvar o estado no localStorage sempre que ele mudar
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // Efeito para aplicar a classe do tema no elemento <html>
  useEffect(() => {
    const isDark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [state.theme]);
  
  const activeDay = state.days.find(d => d.id === state.activeDayId) || null;
  const selectedFunction = null; // Lógica para função selecionada virá aqui

  if (!isInitialized) {
    return null; // ou um componente de loading
  }

  return (
    <AppContext.Provider value={{ state, dispatch, activeDay, selectedFunction }}>
      {children}
    </AppContext.Provider>
  );
};


// --- Hook ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
