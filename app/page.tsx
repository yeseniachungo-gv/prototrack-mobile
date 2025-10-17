'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  DatabaseIcon, 
  TemplateIcon, 
  ChartBarIcon,
  CloudIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/data')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-industrial-600"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-industrial-50 to-industrial-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <DatabaseIcon className="h-8 w-8 text-industrial-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">GiraData Industrial</h1>
            </div>
            <Link href="/login" className="btn-primary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Base de Datos Flexible para la
            <span className="text-industrial-600"> Industria</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Plataforma colaborativa y visual que combina la potencia de una hoja de cálculo 
            con capacidades de archivos adjuntos y automatización inteligente.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-industrial-600 hover:bg-industrial-700 md:py-4 md:text-lg md:px-10">
                Comenzar Ahora
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-industrial-500 rounded-md shadow-lg">
                      <DatabaseIcon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Gestión de Datos Dinámica</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Crea y configura columnas personalizadas con diferentes tipos de datos: texto, números, archivos, fechas y fórmulas.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-industrial-500 rounded-md shadow-lg">
                      <TemplateIcon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Plantillas Preconfiguradas</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Soluciones de nicho listas para usar: mantenimiento de equipos, control de calidad de lotes y más.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-industrial-500 rounded-md shadow-lg">
                      <CloudIcon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Almacenamiento en la Nube</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Sube y gestiona archivos PDF, imágenes y documentos de forma segura en la nube.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-industrial-500 rounded-md shadow-lg">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Fórmulas Inteligentes</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Crea cálculos complejos usando lenguaje natural con asistencia de IA generativa.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-industrial-500 rounded-md shadow-lg">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Seguridad Empresarial</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Autenticación robusta y control de acceso para proteger tus datos industriales.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-industrial-500 rounded-md shadow-lg">
                      <CogIcon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Automatización</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Alertas automáticas por fechas de vencimiento y notificaciones inteligentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}