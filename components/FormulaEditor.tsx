'use client'

import { useState } from 'react'
import { TableColumn } from '@/types/database'
import { aiService } from '@/services/aiService'
import { SparklesIcon, CalculatorIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface FormulaEditorProps {
  value: string
  onChange: (formula: string) => void
  availableColumns: TableColumn[]
  isEditing?: boolean
}

export default function FormulaEditor({ value, onChange, availableColumns, isEditing = false }: FormulaEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [naturalLanguage, setNaturalLanguage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const handleAIGenerate = async () => {
    if (!naturalLanguage.trim()) {
      toast.error('Por favor describe la fórmula que quieres crear')
      return
    }

    setIsGenerating(true)
    
    try {
      const columnNames = availableColumns.map(col => col.name)
      const result = await aiService.generateFormula(naturalLanguage, columnNames)
      
      onChange(result.formula)
      toast.success('Fórmula generada exitosamente')
      setShowAIAssistant(false)
    } catch (error) {
      toast.error('Error al generar la fórmula')
    } finally {
      setIsGenerating(false)
    }
  }

  const insertColumn = (columnName: string) => {
    const newFormula = value + `[${columnName}]`
    onChange(newFormula)
  }

  const insertOperator = (operator: string) => {
    const newFormula = value + ` ${operator} `
    onChange(newFormula)
  }

  const clearFormula = () => {
    onChange('')
  }

  if (!isEditing) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-industrial-500"
        >
          <div className="flex items-center space-x-2">
            <CalculatorIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {value || 'Sin fórmula'}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Editor de Fórmulas
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Formula Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fórmula
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500 font-mono"
                      placeholder="Ej: [Precio] * [Cantidad]"
                    />
                    <button
                      onClick={clearFormula}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* AI Assistant */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <SparklesIcon className="h-5 w-5 text-purple-600" />
                    <h4 className="text-sm font-medium text-gray-900">
                      Asistente de IA
                    </h4>
                  </div>
                  
                  {!showAIAssistant ? (
                    <button
                      onClick={() => setShowAIAssistant(true)}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      Describir fórmula en lenguaje natural
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={naturalLanguage}
                        onChange={(e) => setNaturalLanguage(e.target.value)}
                        placeholder="Ej: Calcula el costo total multiplicando la columna Precio por la columna Cantidad"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleAIGenerate}
                          disabled={isGenerating}
                          className="btn-primary flex items-center text-sm"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generando...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="h-4 w-4 mr-1" />
                              Generar Fórmula
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowAIAssistant(false)}
                          className="btn-secondary text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available Columns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Columnas Disponibles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColumns.map((column) => (
                      <button
                        key={column.id}
                        onClick={() => insertColumn(column.name)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                      >
                        {column.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operators */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operadores
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['+', '-', '*', '/', '(', ')'].map((operator) => (
                      <button
                        key={operator}
                        onClick={() => insertOperator(operator)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                      >
                        {operator}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-primary"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Formula Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fórmula
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500 font-mono"
            placeholder="Ej: [Precio] * [Cantidad]"
          />
          <button
            onClick={clearFormula}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h4 className="text-sm font-medium text-gray-900">
            Asistente de IA
          </h4>
        </div>
        
        {!showAIAssistant ? (
          <button
            onClick={() => setShowAIAssistant(true)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Describir fórmula en lenguaje natural
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={naturalLanguage}
              onChange={(e) => setNaturalLanguage(e.target.value)}
              placeholder="Ej: Calcula el costo total multiplicando la columna Precio por la columna Cantidad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="btn-primary flex items-center text-sm"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-1" />
                    Generar Fórmula
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Available Columns */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Columnas Disponibles
        </label>
        <div className="flex flex-wrap gap-2">
          {availableColumns.map((column) => (
            <button
              key={column.id}
              onClick={() => insertColumn(column.name)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
            >
              {column.name}
            </button>
          ))}
        </div>
      </div>

      {/* Operators */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Operadores
        </label>
        <div className="flex flex-wrap gap-2">
          {['+', '-', '*', '/', '(', ')'].map((operator) => (
            <button
              key={operator}
              onClick={() => insertOperator(operator)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
            >
              {operator}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}