'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simular verificación de sesión persistente
    const savedUser = localStorage.getItem('giradata_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simular autenticación - en producción usar Auth0, Cognito, etc.
      if (email === 'admin@giradata.com' && password === 'admin123') {
        const userData: User = {
          id: '1',
          email,
          name: 'Administrador'
        }
        setUser(userData)
        localStorage.setItem('giradata_user', JSON.stringify(userData))
        toast.success('Inicio de sesión exitoso')
        return true
      } else {
        toast.error('Credenciales inválidas')
        return false
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Simular registro - en producción usar Auth0, Cognito, etc.
      const userData: User = {
        id: Date.now().toString(),
        email,
        name
      }
      setUser(userData)
      localStorage.setItem('giradata_user', JSON.stringify(userData))
      toast.success('Registro exitoso')
      return true
    } catch (error) {
      toast.error('Error al registrarse')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('giradata_user')
    toast.success('Sesión cerrada')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}