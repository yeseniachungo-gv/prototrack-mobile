"use client";

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState } from '@/lib/types';
import { produce } from 'immer';

// Apenas a ação de trocar o tema por enquanto.
type Action = { type: 'TOGGLE_THEME' };

const APP_STATE_KEY = 'prototrack-state-v3'; // Nova chave para garantir um estado limpo

// Estado inicial simplificado
function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Retorna o estado salvo apenas se for válido
        if (parsedState.theme) {
          return parsedState;
        }
      } catch (e) {
        console.error("Falha ao carregar o estado, começando do zero.", e);
      }
    }
  }

  // Estado padrão para um novo começo
  const today = new Date().toISOString().split('T')[0];
  return {
    days: [],
    activeDayId: null,
    theme: 'dark',
  };
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);


// Reducer simplificado, apenas para o tema
const appReducer = (state: AppState, action: Action): AppState => {
  return produce(state, draft => {
      switch (action.type) {
        case 'TOGGLE_THEME':
          draft.theme = draft.theme === 'dark' ? 'light' : 'dark';
          break;
        default:
          break;
      }
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // Salva o estado no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  }, [state]);

  // Aplica a classe do tema no elemento <html>
  useEffect(() => {
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
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
