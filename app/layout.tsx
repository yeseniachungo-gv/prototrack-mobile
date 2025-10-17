import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DatabaseProvider } from '@/contexts/DatabaseContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GiraData Industrial - Base de Datos Flexible',
  description: 'Plataforma de base de datos colaborativa y visual para la industria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <DatabaseProvider>
            {children}
            <Toaster position="top-right" />
          </DatabaseProvider>
        </AuthProvider>
      </body>
    </html>
  )
}