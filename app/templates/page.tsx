'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useDatabase } from '@/contexts/DatabaseContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ChartBarIcon,
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Template } from '@/types/database'
import toast from 'react-hot-toast'

const templates: Template[] = [
  {
    id: 'maintenance',
    name: 'Mantenimiento de Equipos',
    description: 'Control y seguimiento del mantenimiento preventivo y correctivo de equipos industriales',
    category: 'Mantenimiento',
    columns: [
      { name: 'ID de Equipo', type: 'text', order: 0, required: true },
      { name: 'Último Mantenimiento', type: 'date', order: 1, required: true },
      { name: 'Archivo: Manual', type: 'file', order: 2, required: false },
      { name: 'Archivo: Fotos de Falla', type: 'file', order: 3, required: false },
      { name: 'Responsable', type: 'text', order: 4, required: true },
      { name: 'Estado', type: 'multiselect', order: 5, required: true, options: ['Operativo', 'En Reparación', 'Fuera de Servicio', 'Mantenimiento Programado'] },
      { name: 'Próximo Mantenimiento', type: 'date', order: 6, required: false },
      { name: 'Costo de Reparación', type: 'number', order: 7, required: false },
      { name: 'Tiempo de Inactividad (horas)', type: 'number', order: 8, required: false },
      { name: 'Costo Total', type: 'formula', order: 9, required: false, formula: '[Costo de Reparación] + ([Tiempo de Inactividad (horas)] * 50)' }
    ]
  },
  {
    id: 'quality-control',
    name: 'Control de Calidad de Lotes',
    description: 'Seguimiento de calidad y certificación de lotes de producción',
    category: 'Calidad',
    columns: [
      { name: 'Lote ID', type: 'text', order: 0, required: true },
      { name: 'Fecha de Producción', type: 'date', order: 1, required: true },
      { name: 'Índice de Defectos', type: 'number', order: 2, required: true },
      { name: 'Archivo: Certificado de Calidad', type: 'file', order: 3, required: true },
      { name: 'Aprobación Gerente', type: 'multiselect', order: 4, required: true, options: ['Aprobado', 'Rechazado', 'Pendiente', 'En Revisión'] },
      { name: 'Cantidad Producida', type: 'number', order: 5, required: true },
      { name: 'Cantidad Defectuosa', type: 'number', order: 6, required: true },
      { name: 'Porcentaje de Defectos', type: 'formula', order: 7, required: false, formula: '([Cantidad Defectuosa] / [Cantidad Producida]) * 100' },
      { name: 'Inspector', type: 'text', order: 8, required: true },
      { name: 'Observaciones', type: 'text', order: 9, required: false }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventario de Materiales',
    description: 'Control de stock y movimientos de inventario de materias primas y productos',
    category: 'Inventario',
    columns: [
      { name: 'Código de Material', type: 'text', order: 0, required: true },
      { name: 'Descripción', type: 'text', order: 1, required: true },
      { name: 'Stock Actual', type: 'number', order: 2, required: true },
      { name: 'Stock Mínimo', type: 'number', order: 3, required: true },
      { name: 'Precio Unitario', type: 'number', order: 4, required: true },
      { name: 'Proveedor', type: 'text', order: 5, required: true },
      { name: 'Archivo: Ficha Técnica', type: 'file', order: 6, required: false },
      { name: 'Estado de Stock', type: 'multiselect', order: 7, required: true, options: ['Disponible', 'Bajo Stock', 'Agotado', 'Reservado'] },
      { name: 'Valor Total', type: 'formula', order: 8, required: false, formula: '[Stock Actual] * [Precio Unitario]' },
      { name: 'Última Actualización', type: 'date', order: 9, required: true }
    ]
  },
  {
    id: 'safety',
    name: 'Registro de Seguridad',
    description: 'Seguimiento de incidentes, capacitaciones y equipos de protección personal',
    category: 'Seguridad',
    columns: [
      { name: 'ID de Incidente', type: 'text', order: 0, required: true },
      { name: 'Fecha del Incidente', type: 'date', order: 1, required: true },
      { name: 'Tipo de Incidente', type: 'multiselect', order: 2, required: true, options: ['Accidente', 'Casi Accidente', 'Condición Insegura', 'Acto Inseguro'] },
      { name: 'Archivo: Reporte', type: 'file', order: 3, required: true },
      { name: 'Archivo: Fotos', type: 'file', order: 4, required: false },
      { name: 'Empleado Afectado', type: 'text', order: 5, required: true },
      { name: 'Severidad', type: 'multiselect', order: 6, required: true, options: ['Leve', 'Moderada', 'Grave', 'Crítica'] },
      { name: 'Acciones Correctivas', type: 'text', order: 7, required: true },
      { name: 'Responsable de Seguimiento', type: 'text', order: 8, required: true },
      { name: 'Fecha de Cierre', type: 'date', order: 9, required: false }
    ]
  }
]

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth()
  const { createTable } = useDatabase()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleUseTemplate = async (template: Template) => {
    try {
      await createTable(template.name, template.columns)
      toast.success(`Plantilla "${template.name}" aplicada exitosamente`)
      router.push('/data')
    } catch (error) {
      toast.error('Error al aplicar la plantilla')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mantenimiento':
        return <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
      case 'Calidad':
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />
      case 'Inventario':
        return <ChartBarIcon className="h-8 w-8 text-purple-600" />
      case 'Seguridad':
        return <CheckCircleIcon className="h-8 w-8 text-red-600" />
      default:
        return <ChartBarIcon className="h-8 w-8 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Mantenimiento':
        return 'bg-blue-100 text-blue-800'
      case 'Calidad':
        return 'bg-green-100 text-green-800'
      case 'Inventario':
        return 'bg-purple-100 text-purple-800'
      case 'Seguridad':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/data')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Soluciones Preconfiguradas
          </h2>
          <p className="text-gray-600">
            Selecciona una plantilla para crear rápidamente una tabla con la estructura optimizada para tu industria.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Template Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getCategoryIcon(template.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.description}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Template Details */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Columnas incluidas ({template.columns.length})
                  </h4>
                  <div className="space-y-1">
                    {template.columns.slice(0, 5).map((column, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{column.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {column.type}
                        </span>
                      </div>
                    ))}
                    {template.columns.length > 5 && (
                      <div className="text-xs text-gray-500">
                        +{template.columns.length - 5} columnas más...
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Características
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.columns.some(col => col.type === 'file') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📎 Archivos Adjuntos
                      </span>
                    )}
                    {template.columns.some(col => col.type === 'formula') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🧮 Fórmulas
                      </span>
                    )}
                    {template.columns.some(col => col.type === 'date') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📅 Fechas
                      </span>
                    )}
                    {template.columns.some(col => col.type === 'multiselect') && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🏷️ Etiquetas
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Usar esta Plantilla
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Template Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¿No encuentras lo que necesitas?
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu propia tabla personalizada desde cero.
            </p>
            <button
              onClick={() => router.push('/data')}
              className="btn-secondary"
            >
              Crear Tabla Personalizada
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}