'use client'

import { useState } from 'react'
import { useDatabase } from '@/contexts/DatabaseContext'
import { TableColumn, FieldType } from '@/types/database'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import FieldEditor from './FieldEditor'
import FileUploader from './FileUploader'
import DatePicker from './DatePicker'
import MultiSelect from './MultiSelect'
import FormulaEditor from './FormulaEditor'
import toast from 'react-hot-toast'

export default function DataTable() {
  const { state, createRecord, updateRecord, deleteRecord } = useDatabase()
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null)
  const [editingValue, setEditingValue] = useState<any>('')
  const [showAddRow, setShowAddRow] = useState(false)
  const [newRowData, setNewRowData] = useState<Record<string, any>>({})

  if (!state.currentTable) {
    return null
  }

  const handleCellEdit = (rowId: string, columnId: string, currentValue: any) => {
    setEditingCell({ rowId, columnId })
    setEditingValue(currentValue || '')
  }

  const handleCellSave = async () => {
    if (!editingCell) return

    try {
      const updatedData = {
        ...state.records.find(r => r.id === editingCell.rowId)?.data || {},
        [editingCell.columnId]: editingValue
      }

      await updateRecord(editingCell.rowId, updatedData)
      setEditingCell(null)
      setEditingValue('')
      toast.success('Registro actualizado')
    } catch (error) {
      toast.error('Error al actualizar el registro')
    }
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setEditingValue('')
  }

  const handleAddRow = async () => {
    try {
      await createRecord(state.currentTable!.id, newRowData)
      setNewRowData({})
      setShowAddRow(false)
      toast.success('Registro creado')
    } catch (error) {
      toast.error('Error al crear el registro')
    }
  }

  const handleDeleteRow = async (rowId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        await deleteRecord(rowId)
        toast.success('Registro eliminado')
      } catch (error) {
        toast.error('Error al eliminar el registro')
      }
    }
  }

  const renderCellContent = (record: any, column: TableColumn) => {
    const value = record.data[column.id] || ''
    const isEditing = editingCell?.rowId === record.id && editingCell?.columnId === column.id

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {renderFieldEditor(column, editingValue, setEditingValue)}
          <button
            onClick={handleCellSave}
            className="text-green-600 hover:text-green-800"
          >
            ✓
          </button>
          <button
            onClick={handleCellCancel}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
        onClick={() => handleCellEdit(record.id, column.id, value)}
      >
        {renderFieldDisplay(column, value)}
      </div>
    )
  }

  const renderFieldDisplay = (column: TableColumn, value: any) => {
    switch (column.type) {
      case 'file':
        if (Array.isArray(value) && value.length > 0) {
          return (
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
          )
        }
        return <span className="text-gray-400">Sin archivos</span>

      case 'multiselect':
        if (Array.isArray(value) && value.length > 0) {
          return (
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
          )
        }
        return <span className="text-gray-400">Sin selección</span>

      case 'date':
        return value ? new Date(value).toLocaleDateString('es-ES') : <span className="text-gray-400">Sin fecha</span>

      case 'formula':
        return (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value || 'Sin fórmula'}
          </span>
        )

      default:
        return value || <span className="text-gray-400">Vacío</span>
    }
  }

  const renderFieldEditor = (column: TableColumn, value: any, onChange: (value: any) => void) => {
    switch (column.type) {
      case 'file':
        return <FileUploader value={value} onChange={onChange} multiple />

      case 'multiselect':
        return (
          <MultiSelect
            value={value || []}
            onChange={onChange}
            options={column.options || []}
          />
        )

      case 'date':
        return <DatePicker value={value} onChange={onChange} />

      case 'formula':
        return (
          <FormulaEditor
            value={value}
            onChange={onChange}
            availableColumns={state.currentTable?.columns || []}
          />
        )

      default:
        return (
          <input
            type={column.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            autoFocus
          />
        )
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {state.currentTable.name}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddRow(!showAddRow)}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Agregar Fila
            </button>
          </div>
        </div>
      </div>

      {/* Add Row Form */}
      {showAddRow && (
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.currentTable.columns.map((column) => (
              <div key={column.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.name}
                </label>
                {renderFieldEditor(column, newRowData[column.id], (value) => 
                  setNewRowData(prev => ({ ...prev, [column.id]: value }))
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowAddRow(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddRow}
              className="btn-primary"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {state.currentTable.columns.map((column) => (
                <th key={column.id} className="table-header">
                  {column.name}
                </th>
              ))}
              <th className="table-header w-20">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {state.records.length === 0 ? (
              <tr>
                <td
                  colSpan={state.currentTable.columns.length + 1}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No hay registros. Agrega el primer registro usando el botón "Agregar Fila".
                </td>
              </tr>
            ) : (
              state.records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {state.currentTable!.columns.map((column) => (
                    <td key={column.id} className="table-cell">
                      {renderCellContent(record, column)}
                    </td>
                  ))}
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteRow(record.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}