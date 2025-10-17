export type FieldType = 
  | 'text' 
  | 'number' 
  | 'file' 
  | 'multiselect' 
  | 'date' 
  | 'formula'

export interface TableColumn {
  id: string
  name: string
  type: FieldType
  order: number
  required?: boolean
  options?: string[] // Para multiselect
  formula?: string // Para campos de fórmula
}

export interface TableStructure {
  id: string
  name: string
  columns: TableColumn[]
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface DataRecord {
  id: string
  tableId: string
  data: Record<string, any>
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface FileAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: Date
}

export interface Template {
  id: string
  name: string
  description: string
  columns: Omit<TableColumn, 'id'>[]
  category: string
}

// Tipos para el contexto de la aplicación
export interface AppState {
  currentTable: TableStructure | null
  tables: TableStructure[]
  records: DataRecord[]
  loading: boolean
  error: string | null
}

// Tipos para las acciones del contexto
export type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_TABLE'; payload: TableStructure | null }
  | { type: 'SET_TABLES'; payload: TableStructure[] }
  | { type: 'ADD_TABLE'; payload: TableStructure }
  | { type: 'UPDATE_TABLE'; payload: TableStructure }
  | { type: 'DELETE_TABLE'; payload: string }
  | { type: 'SET_RECORDS'; payload: DataRecord[] }
  | { type: 'ADD_RECORD'; payload: DataRecord }
  | { type: 'UPDATE_RECORD'; payload: DataRecord }
  | { type: 'DELETE_RECORD'; payload: string }