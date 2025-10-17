'use client'

import { useState } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { TableColumn, FieldType } from '@/types/database'

interface TableConfigModalProps {
  onClose: () => void
  onSave: (name: string, columns: Omit<TableColumn, 'id'>[]) => void
}

export default function TableConfigModal({ onClose, onSave }: TableConfigModalProps) {
  const [tableName, setTableName] = useState('')
  const [columns, setColumns] = useState<Omit<TableColumn, 'id'>[]>([
    { name: 'ID', type: 'text', order: 0, required: true }
  ])

  const addColumn = () => {
    setColumns([...columns, {
      name: `Columna ${columns.length + 1}`,
      type: 'text',
      order: columns.length,
      required: false
    }])
  }

  const updateColumn = (index: number, field: keyof Omit<TableColumn, 'id'>, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      const newColumns = columns.filter((_, i) => i !== index)
      // Reordenar los índices
      newColumns.forEach((col, i) => {
        col.order = i
      })
      setColumns(newColumns)
    }
  }

  const handleSave = () => {
    if (!tableName.trim()) {
      alert('Por favor ingresa un nombre para la tabla')
      return
    }

    if (columns.some(col => !col.name.trim())) {
      alert('Por favor completa todos los nombres de columnas')
      return
    }

    onSave(tableName, columns)
  }

  const fieldTypeOptions: { value: FieldType; label: string; description: string }[] = [
    { value: 'text', label: 'Texto', description: 'Campo de texto libre' },
    { value: 'number', label: 'Número', description: 'Valores numéricos' },
    { value: 'file', label: 'Archivo Adjunto', description: 'Subir archivos (PDF, imágenes)' },
    { value: 'multiselect', label: 'Selección Múltiple', description: 'Etiquetas configurables' },
    { value: 'date', label: 'Fecha de Vencimiento', description: 'Selector de calendario' },
    { value: 'formula', label: 'Fórmula', description: 'Cálculos automáticos' }
  ]

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Configurar Nueva Tabla
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Table Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Tabla
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="input-field"
              placeholder="Ej: Inventario de Equipos"
            />
          </div>

          {/* Columns */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Columnas
              </label>
              <button
                onClick={addColumn}
                className="btn-primary flex items-center text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Agregar Columna
              </button>
            </div>

            <div className="space-y-4">
              {columns.map((column, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => updateColumn(index, 'name', e.target.value)}
                        className="input-field"
                        placeholder="Nombre de la columna"
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={column.type}
                        onChange={(e) => updateColumn(index, 'type', e.target.value as FieldType)}
                        className="input-field"
                      >
                        {fieldTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {fieldTypeOptions.find(opt => opt.value === column.type)?.description}
                      </p>
                    </div>

                    {/* Required */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={column.required || false}
                        onChange={(e) => updateColumn(index, 'required', e.target.checked)}
                        className="h-4 w-4 text-industrial-600 focus:ring-industrial-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-700">
                        Requerido
                      </label>
                    </div>
                  </div>

                  {/* Options for multiselect */}
                  {column.type === 'multiselect' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opciones (separadas por comas)
                      </label>
                      <input
                        type="text"
                        value={column.options?.join(', ') || ''}
                        onChange={(e) => updateColumn(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="input-field"
                        placeholder="Opción 1, Opción 2, Opción 3"
                      />
                    </div>
                  )}

                  {/* Remove Column Button */}
                  {columns.length > 1 && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => removeColumn(index)}
                        className="text-red-600 hover:text-red-800 flex items-center text-sm"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Eliminar Columna
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Crear Tabla
          </button>
        </div>
      </div>
    </div>
  )
}