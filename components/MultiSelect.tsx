'use client'

import { useState, useRef, useEffect } from 'react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface MultiSelectProps {
  value: string[]
  onChange: (values: string[]) => void
  options: string[]
  isEditing?: boolean
}

export default function MultiSelect({ value, onChange, options, isEditing = false }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newOption, setNewOption] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const updatedOptions = [...options, newOption.trim()]
      onChange([...value, newOption.trim()])
      setNewOption('')
    }
  }

  const handleRemoveValue = (optionToRemove: string) => {
    onChange(value.filter(v => v !== optionToRemove))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!isEditing) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-industrial-500"
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-400">Haz clic para seleccionar</span>
          )}
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Seleccionar Opciones
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Search */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar opciones..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500"
                />

                {/* Add new option */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Agregar nueva opción..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                  />
                  <button
                    onClick={handleAddOption}
                    className="btn-primary"
                  >
                    Agregar
                  </button>
                </div>

                {/* Options list */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={value.includes(option)}
                        onChange={() => handleToggleOption(option)}
                        className="h-4 w-4 text-industrial-600 focus:ring-industrial-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{option}</span>
                    </label>
                  ))}
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
    <div className="w-full" ref={dropdownRef}>
      {/* Selected values */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {item}
              <button
                onClick={() => handleRemoveValue(item)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-industrial-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {value.length > 0 ? `${value.length} seleccionadas` : 'Seleccionar opciones...'}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Search */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-industrial-500"
              />
            </div>

            {/* Add new option */}
            <div className="p-2 border-b border-gray-200">
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nueva opción..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-industrial-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                />
                <button
                  onClick={handleAddOption}
                  className="px-2 py-1 text-xs bg-industrial-600 text-white rounded hover:bg-industrial-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Options */}
            {filteredOptions.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="h-4 w-4 text-industrial-600 focus:ring-industrial-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">{option}</span>
                {value.includes(option) && (
                  <CheckIcon className="h-4 w-4 text-industrial-600" />
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}