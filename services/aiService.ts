// Servicio de IA para generar fórmulas a partir de lenguaje natural
// En producción esto se conectaría con OpenAI, Claude, Gemini, etc.

export class AIService {
  private static instance: AIService

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateFormula(naturalLanguage: string, availableColumns: string[]): Promise<{ formula: string; explanation: string }> {
    // Simulación de respuesta de IA
    // En producción esto haría una llamada real a la API de IA
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.parseNaturalLanguageToFormula(naturalLanguage, availableColumns)
        resolve(result)
      }, 1000) // Simular latencia de red
    })
  }

  private parseNaturalLanguageToFormula(naturalLanguage: string, availableColumns: string[]): { formula: string; explanation: string } {
    const lowerText = naturalLanguage.toLowerCase()
    
    // Patrones comunes para detectar operaciones
    if (lowerText.includes('multiplicar') || lowerText.includes('multiplicación') || lowerText.includes('por')) {
      return this.handleMultiplication(naturalLanguage, availableColumns)
    }
    
    if (lowerText.includes('sumar') || lowerText.includes('suma') || lowerText.includes('más')) {
      return this.handleAddition(naturalLanguage, availableColumns)
    }
    
    if (lowerText.includes('restar') || lowerText.includes('resta') || lowerText.includes('menos')) {
      return this.handleSubtraction(naturalLanguage, availableColumns)
    }
    
    if (lowerText.includes('dividir') || lowerText.includes('división') || lowerText.includes('entre')) {
      return this.handleDivision(naturalLanguage, availableColumns)
    }
    
    if (lowerText.includes('promedio') || lowerText.includes('media')) {
      return this.handleAverage(naturalLanguage, availableColumns)
    }
    
    if (lowerText.includes('total') || lowerText.includes('suma total')) {
      return this.handleSum(naturalLanguage, availableColumns)
    }
    
    // Si no se puede parsear, devolver una fórmula básica
    return {
      formula: availableColumns[0] || '[Columna1]',
      explanation: 'Fórmula básica generada. Por favor, ajusta manualmente si es necesario.'
    }
  }

  private handleMultiplication(text: string, columns: string[]): { formula: string; explanation: string } {
    const column1 = this.findColumnInText(text, columns, 0)
    const column2 = this.findColumnInText(text, columns, 1)
    
    if (column1 && column2) {
      return {
        formula: `[${column1}] * [${column2}]`,
        explanation: `Multiplica la columna "${column1}" por la columna "${column2}"`
      }
    }
    
    return {
      formula: columns[0] ? `[${columns[0]}] * [${columns[1] || columns[0]}]` : '[Columna1] * [Columna2]',
      explanation: 'Fórmula de multiplicación generada'
    }
  }

  private handleAddition(text: string, columns: string[]): { formula: string; explanation: string } {
    const column1 = this.findColumnInText(text, columns, 0)
    const column2 = this.findColumnInText(text, columns, 1)
    
    if (column1 && column2) {
      return {
        formula: `[${column1}] + [${column2}]`,
        explanation: `Suma la columna "${column1}" más la columna "${column2}"`
      }
    }
    
    return {
      formula: columns[0] ? `[${columns[0]}] + [${columns[1] || columns[0]}]` : '[Columna1] + [Columna2]',
      explanation: 'Fórmula de suma generada'
    }
  }

  private handleSubtraction(text: string, columns: string[]): { formula: string; explanation: string } {
    const column1 = this.findColumnInText(text, columns, 0)
    const column2 = this.findColumnInText(text, columns, 1)
    
    if (column1 && column2) {
      return {
        formula: `[${column1}] - [${column2}]`,
        explanation: `Resta la columna "${column2}" de la columna "${column1}"`
      }
    }
    
    return {
      formula: columns[0] ? `[${columns[0]}] - [${columns[1] || columns[0]}]` : '[Columna1] - [Columna2]',
      explanation: 'Fórmula de resta generada'
    }
  }

  private handleDivision(text: string, columns: string[]): { formula: string; explanation: string } {
    const column1 = this.findColumnInText(text, columns, 0)
    const column2 = this.findColumnInText(text, columns, 1)
    
    if (column1 && column2) {
      return {
        formula: `[${column1}] / [${column2}]`,
        explanation: `Divide la columna "${column1}" entre la columna "${column2}"`
      }
    }
    
    return {
      formula: columns[0] ? `[${columns[0]}] / [${columns[1] || columns[0]}]` : '[Columna1] / [Columna2]',
      explanation: 'Fórmula de división generada'
    }
  }

  private handleAverage(text: string, columns: string[]): { formula: string; explanation: string } {
    const relevantColumns = this.findMultipleColumnsInText(text, columns)
    
    if (relevantColumns.length > 0) {
      const formula = `(${relevantColumns.map(col => `[${col}]`).join(' + ')}) / ${relevantColumns.length}`
      return {
        formula,
        explanation: `Calcula el promedio de las columnas: ${relevantColumns.join(', ')}`
      }
    }
    
    return {
      formula: columns[0] ? `[${columns[0]}]` : '[Columna1]',
      explanation: 'Fórmula de promedio generada'
    }
  }

  private handleSum(text: string, columns: string[]): { formula: string; explanation: string } {
    const relevantColumns = this.findMultipleColumnsInText(text, columns)
    
    if (relevantColumns.length > 0) {
      const formula = relevantColumns.map(col => `[${col}]`).join(' + ')
      return {
        formula,
        explanation: `Suma total de las columnas: ${relevantColumns.join(', ')}`
      }
    }
    
    return {
      formula: columns[0] ? `[${columns[0]}]` : '[Columna1]',
      explanation: 'Fórmula de suma total generada'
    }
  }

  private findColumnInText(text: string, columns: string[], index: number): string | null {
    const lowerText = text.toLowerCase()
    
    for (const column of columns) {
      if (lowerText.includes(column.toLowerCase())) {
        return column
      }
    }
    
    return columns[index] || null
  }

  private findMultipleColumnsInText(text: string, columns: string[]): string[] {
    const lowerText = text.toLowerCase()
    const foundColumns: string[] = []
    
    for (const column of columns) {
      if (lowerText.includes(column.toLowerCase())) {
        foundColumns.push(column)
      }
    }
    
    return foundColumns.length > 0 ? foundColumns : columns.slice(0, 2)
  }
}

export const aiService = AIService.getInstance()