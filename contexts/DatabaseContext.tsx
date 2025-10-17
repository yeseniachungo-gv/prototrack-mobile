'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { AppState, AppAction, TableStructure, DataRecord, TableColumn } from '@/types/database'
import { v4 as uuidv4 } from 'uuid'

const initialState: AppState = {
  currentTable: null,
  tables: [],
  records: [],
  loading: false,
  error: null,
}

function databaseReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_CURRENT_TABLE':
      return { ...state, currentTable: action.payload }
    
    case 'SET_TABLES':
      return { ...state, tables: action.payload }
    
    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, action.payload] }
    
    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(table => 
          table.id === action.payload.id ? action.payload : table
        ),
        currentTable: state.currentTable?.id === action.payload.id ? action.payload : state.currentTable
      }
    
    case 'DELETE_TABLE':
      return {
        ...state,
        tables: state.tables.filter(table => table.id !== action.payload),
        currentTable: state.currentTable?.id === action.payload ? null : state.currentTable
      }
    
    case 'SET_RECORDS':
      return { ...state, records: action.payload }
    
    case 'ADD_RECORD':
      return { ...state, records: [...state.records, action.payload] }
    
    case 'UPDATE_RECORD':
      return {
        ...state,
        records: state.records.map(record => 
          record.id === action.payload.id ? action.payload : record
        )
      }
    
    case 'DELETE_RECORD':
      return {
        ...state,
        records: state.records.filter(record => record.id !== action.payload)
      }
    
    default:
      return state
  }
}

interface DatabaseContextType {
  state: AppState
  createTable: (name: string, columns: Omit<TableColumn, 'id'>[]) => Promise<TableStructure>
  updateTable: (table: TableStructure) => Promise<void>
  deleteTable: (tableId: string) => Promise<void>
  loadTable: (tableId: string) => Promise<void>
  createRecord: (tableId: string, data: Record<string, any>) => Promise<DataRecord>
  updateRecord: (recordId: string, data: Record<string, any>) => Promise<void>
  deleteRecord: (recordId: string) => Promise<void>
  loadRecords: (tableId: string) => Promise<void>
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(databaseReducer, initialState)

  const createTable = async (name: string, columns: Omit<TableColumn, 'id'>[]): Promise<TableStructure> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const table: TableStructure = {
        id: uuidv4(),
        name,
        columns: columns.map((col, index) => ({
          ...col,
          id: uuidv4(),
          order: index
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'current-user' // En producción esto vendría del contexto de auth
      }
      
      dispatch({ type: 'ADD_TABLE', payload: table })
      dispatch({ type: 'SET_LOADING', payload: false })
      
      return table
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al crear la tabla' })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const updateTable = async (table: TableStructure): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const updatedTable = {
        ...table,
        updatedAt: new Date()
      }
      
      dispatch({ type: 'UPDATE_TABLE', payload: updatedTable })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar la tabla' })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const deleteTable = async (tableId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      dispatch({ type: 'DELETE_TABLE', payload: tableId })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar la tabla' })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const loadTable = async (tableId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const table = state.tables.find(t => t.id === tableId)
      if (table) {
        dispatch({ type: 'SET_CURRENT_TABLE', payload: table })
        await loadRecords(tableId)
      }
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar la tabla' })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const createRecord = async (tableId: string, data: Record<string, any>): Promise<DataRecord> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const record: DataRecord = {
        id: uuidv4(),
        tableId,
        data,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'current-user'
      }
      
      dispatch({ type: 'ADD_RECORD', payload: record })
      dispatch({ type: 'SET_LOADING', payload: false })
      
      return record
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al crear el registro' })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const updateRecord = async (recordId: string, data: Record<string, any>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const existingRecord = state.records.find(r => r.id === recordId)
      if (existingRecord) {
        const updatedRecord = {
          ...existingRecord,
          data,
          updatedAt: new Date()
        }
        
        dispatch({ type: 'UPDATE_RECORD', payload: updatedRecord })
      }
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar el registro' })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const deleteRecord = async (recordId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      dispatch({ type: 'DELETE_RECORD', payload: recordId })
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar el registro' })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const loadRecords = async (tableId: string): Promise<void> => {
    try {
      const records = state.records.filter(r => r.tableId === tableId)
      dispatch({ type: 'SET_RECORDS', payload: records })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los registros' })
      throw error
    }
  }

  return (
    <DatabaseContext.Provider value={{
      state,
      createTable,
      updateTable,
      deleteTable,
      loadTable,
      createRecord,
      updateRecord,
      deleteRecord,
      loadRecords
    }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}