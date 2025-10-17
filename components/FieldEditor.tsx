'use client'

import { useState } from 'react'
import { TableColumn, FieldType } from '@/types/database'
import FileUploader from './FileUploader'
import DatePicker from './DatePicker'
import MultiSelect from './MultiSelect'
import FormulaEditor from './FormulaEditor'

interface FieldEditorProps {
  column: TableColumn
  value: any
  onChange: (value: any) => void
  isEditing?: boolean
}

export default function FieldEditor({ column, value, onChange, isEditing = false }: FieldEditorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const renderField = () => {
    switch (column.type) {
      case 'file':
        return (
          <FileUploader
            value={value}
            onChange={onChange}
            multiple
            isEditing={isEditing}
          />
        )

      case 'multiselect':
        return (
          <MultiSelect
            value={value || []}
            onChange={onChange}
            options={column.options || []}
            isEditing={isEditing}
          />
        )

      case 'date':
        return (
          <DatePicker
            value={value}
            onChange={onChange}
            isEditing={isEditing}
          />
        )

      case 'formula':
        return (
          <FormulaEditor
            value={value}
            onChange={onChange}
            availableColumns={[]} // Se pasará desde el componente padre
            isEditing={isEditing}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500"
            placeholder="Ingresa un número"
            disabled={!isEditing}
          />
        )

      default: // text
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500"
            placeholder="Ingresa texto"
            disabled={!isEditing}
          />
        )
    }
  }

  if (isEditing) {
    return renderField()
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-industrial-500"
      >
        {value ? (
          <div className="text-sm text-gray-900">
            {column.type === 'file' && Array.isArray(value) ? (
              <div className="flex flex-wrap gap-1">
                {value.map((file: any, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    📎 {file.name}
                  </span>
                ))}
              </div>
            ) : column.type === 'multiselect' && Array.isArray(value) ? (
              <div className="flex flex-wrap gap-1">
                {value.map((item: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : column.type === 'date' ? (
              new Date(value).toLocaleDateString('es-ES')
            ) : column.type === 'formula' ? (
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {value || 'Sin fórmula'}
              </span>
            ) : (
              value
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            {column.required ? 'Campo requerido' : 'Haz clic para editar'}
          </div>
        )}
      </button>

      {/* Modal for complex field editing */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Editar {column.name}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              {renderField()}
            </div>

            <div className="flex justify-end space-x-3">
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