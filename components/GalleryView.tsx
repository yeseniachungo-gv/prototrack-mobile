'use client'

import { useDatabase } from '@/contexts/DatabaseContext'
import { FileAttachment } from '@/types/database'
import { PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline'

export default function GalleryView() {
  const { state } = useDatabase()

  if (!state.currentTable) {
    return null
  }

  // Encontrar la columna de archivos
  const fileColumn = state.currentTable.columns.find(col => col.type === 'file')
  
  if (!fileColumn) {
    return (
      <div className="text-center py-12">
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay columna de archivos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Esta tabla no tiene una columna de tipo "Archivo Adjunto" para mostrar en la vista de galería.
        </p>
      </div>
    )
  }

  // Obtener registros que tienen archivos
  const recordsWithFiles = state.records.filter(record => {
    const files = record.data[fileColumn.id]
    return files && (Array.isArray(files) ? files.length > 0 : files)
  })

  if (recordsWithFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay archivos</h3>
        <p className="mt-1 text-sm text-gray-500">
          No hay registros con archivos adjuntos para mostrar en la galería.
        </p>
      </div>
    )
  }

  const getFirstFile = (files: FileAttachment | FileAttachment[]): FileAttachment | null => {
    if (Array.isArray(files)) {
      return files[0] || null
    }
    return files || null
  }

  const isImage = (file: FileAttachment): boolean => {
    return file.type.startsWith('image/')
  }

  const getFileIcon = (file: FileAttachment) => {
    if (isImage(file)) {
      return null // Se mostrará la imagen
    }
    
    if (file.type === 'application/pdf') {
      return <DocumentIcon className="h-8 w-8 text-red-500" />
    }
    
    return <DocumentIcon className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">
          Vista de Galería - {state.currentTable.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {recordsWithFiles.length} registro(s) con archivos adjuntos
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recordsWithFiles.map((record) => {
            const firstFile = getFirstFile(record.data[fileColumn.id])
            
            if (!firstFile) return null

            return (
              <div
                key={record.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* File Preview */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {isImage(firstFile) ? (
                    <img
                      src={firstFile.url}
                      alt={firstFile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      {getFileIcon(firstFile)}
                      <span className="text-xs mt-2 text-center px-2">
                        {firstFile.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {firstFile.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {(firstFile.size / 1024).toFixed(1)} KB
                  </p>
                  
                  {/* Additional Files Count */}
                  {Array.isArray(record.data[fileColumn.id]) && record.data[fileColumn.id].length > 1 && (
                    <p className="text-xs text-blue-600 mt-1">
                      +{record.data[fileColumn.id].length - 1} archivo(s) más
                    </p>
                  )}

                  {/* Record Data Preview */}
                  <div className="mt-3 space-y-1">
                    {state.currentTable.columns
                      .filter(col => col.id !== fileColumn.id)
                      .slice(0, 2)
                      .map((column) => (
                        <div key={column.id} className="text-xs">
                          <span className="font-medium text-gray-700">
                            {column.name}:
                          </span>
                          <span className="ml-1 text-gray-600">
                            {record.data[column.id] || 'N/A'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => window.open(firstFile.url, '_blank')}
                    className="w-full text-xs bg-industrial-600 text-white py-2 px-3 rounded hover:bg-industrial-700 transition-colors"
                  >
                    Ver Archivo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}