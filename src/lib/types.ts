export interface Observation {
  id: string; // workerId_hour
  type: 'note' | 'defect' | 'downtime';
  reason: string; // Motivo da parada/observação
  detail: string; // Detalhe textual
}

export interface FunctionEntry {
  id: string;
  name: string;
  // Estrutura da planilha
  workers: string[]; // Nomes ou IDs dos trabalhadores
  hours: string[]; // Horas da planilha, ex: "08:00"
  // Dados da planilha
  pieces: { [workerId_hour: string]: number }; // Ex: { 'worker1_08:00': 120 }
  observations: { [workerId_hour: string]: Observation }; // Ex: { 'worker1_09:00': { type: 'downtime', ... } }
}

export interface Day {
  id: string; // ISO Date string 'YYYY-MM-DD'
  functions: FunctionEntry[];
}

// O estado geral da aplicação, persistido por perfil
export interface AppState {
  days: Day[];
  activeDayId: string | null;
  theme: 'light' | 'dark';
}
