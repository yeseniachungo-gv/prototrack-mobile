'use client'

import { useState } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'

interface DatePickerProps {
  value: string | Date | null
  onChange: (date: string | null) => void
  isEditing?: boolean
}

export default function DatePicker({ value, onChange, isEditing = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) {
      const date = new Date(value)
      return date.toISOString().split('T')[0]
    }
    return ''
  })

  const handleDateChange = (dateString: string) => {
    setSelectedDate(dateString)
    onChange(dateString || null)
  }

  const handleSave = () => {
    onChange(selectedDate || null)
    setIsOpen(false)
  }

  const formatDisplayDate = (date: string | Date | null) => {
    if (!date) return 'Sin fecha'
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isEditing) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-industrial-500"
        >
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {formatDisplayDate(value)}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Seleccionar Fecha
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
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
    <div className="w-full">
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-4 w-4 text-gray-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500"
        />
      </div>
    </div>
  )
}