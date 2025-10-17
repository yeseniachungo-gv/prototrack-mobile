import { FileAttachment } from '@/types/database'

// Simulación de servicio de almacenamiento de archivos
// En producción esto se conectaría con S3, GCS, etc.

export class FileStorageService {
  private static instance: FileStorageService
  private files: Map<string, FileAttachment> = new Map()

  static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService()
    }
    return FileStorageService.instance
  }

  async uploadFile(file: File): Promise<FileAttachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const fileAttachment: FileAttachment = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: reader.result as string, // En producción sería la URL del S3/GCS
          type: file.type,
          size: file.size,
          uploadedAt: new Date()
        }
        
        this.files.set(fileAttachment.id, fileAttachment)
        resolve(fileAttachment)
      }
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  async uploadMultipleFiles(files: File[]): Promise<FileAttachment[]> {
    const uploadPromises = files.map(file => this.uploadFile(file))
    return Promise.all(uploadPromises)
  }

  async deleteFile(fileId: string): Promise<void> {
    this.files.delete(fileId)
  }

  async getFile(fileId: string): Promise<FileAttachment | null> {
    return this.files.get(fileId) || null
  }

  async getFiles(fileIds: string[]): Promise<FileAttachment[]> {
    return fileIds.map(id => this.files.get(id)).filter(Boolean) as FileAttachment[]
  }

  // Método para generar URL de descarga segura (simulado)
  generateSecureUrl(fileId: string): string {
    const file = this.files.get(fileId)
    return file ? file.url : ''
  }

  // Método para validar tipos de archivo permitidos
  isAllowedFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    return allowedTypes.includes(file.type)
  }

  // Método para obtener el tamaño máximo permitido (10MB)
  getMaxFileSize(): number {
    return 10 * 1024 * 1024 // 10MB
  }

  // Método para validar el archivo antes de subir
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.isAllowedFileType(file)) {
      return { valid: false, error: 'Tipo de archivo no permitido' }
    }
    
    if (file.size > this.getMaxFileSize()) {
      return { valid: false, error: 'El archivo es demasiado grande (máximo 10MB)' }
    }
    
    return { valid: true }
  }
}

export const fileStorageService = FileStorageService.getInstance()