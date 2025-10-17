'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useDatabase } from '@/contexts/DatabaseContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PlusIcon, TableCellsIcon, PhotoIcon, CogIcon } from '@heroicons/react/24/outline'
import DataTable from '@/components/DataTable'
import GalleryView from '@/components/GalleryView'
import TableConfigModal from '@/components/TableConfigModal'
import { TableStructure } from '@/types/database'

export default function DataPage() {
  const { user, loading: authLoading } = useAuth()
  const { state, createTable } = useDatabase()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table')
  const [showConfigModal, setShowConfigModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-industrial-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleCreateTable = async (name: string, columns: any[]) => {
    try {
      await createTable(name, columns)
      setShowConfigModal(false)
    } catch (error) {
      console.error('Error creating table:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Datos</h1>
              {state.currentTable && (
                <span className="ml-4 px-3 py-1 bg-industrial-100 text-industrial-800 text-sm font-medium rounded-full">
                  {state.currentTable.name}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Toggle View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TableCellsIcon className="h-4 w-4 mr-2" />
                  Tabla
                </button>
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'gallery'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <PhotoIcon className="h-4 w-4 mr-2" />
                  Galería
                </button>
              </div>

              {/* Create Table Button */}
              <button
                onClick={() => setShowConfigModal(true)}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Tabla
              </button>

              {/* Settings Button */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <CogIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {state.loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-industrial-600"></div>
          </div>
        )}

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{state.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!state.currentTable ? (
          <div className="text-center py-12">
            <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tabla seleccionada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crea una nueva tabla o selecciona una existente para comenzar.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowConfigModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Crear Primera Tabla
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <DataTable />
            ) : (
              <GalleryView />
            )}
          </>
        )}
      </main>

      {/* Table Configuration Modal */}
      {showConfigModal && (
        <TableConfigModal
          onClose={() => setShowConfigModal(false)}
          onSave={handleCreateTable}
        />
      )}
    </div>
  )
}