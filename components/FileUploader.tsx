'use client'

import { useState, useRef } from 'react'
import { fileStorageService } from '@/services/fileStorage'
import { FileAttachment } from '@/types/database'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface FileUploaderProps {
  value: FileAttachment[] | FileAttachment | null
  onChange: (files: FileAttachment[] | FileAttachment | null) => void
  multiple?: boolean
  isEditing?: boolean
}

export default function FileUploader({ value, onChange, multiple = false, isEditing = false }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)
    
    // Validar archivos
    for (const file of fileArray) {
      const validation = fileStorageService.validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error!)
        return
      }
    }

    setIsUploading(true)
    
    try {
      const uploadedFiles = await fileStorageService.uploadMultipleFiles(fileArray)
      
      if (multiple) {
        const currentFiles = Array.isArray(value) ? value : []
        onChange([...currentFiles, ...uploadedFiles])
      } else {
        onChange(uploadedFiles[0] || null)
      }
      
      toast.success(`${uploadedFiles.length} archivo(s) subido(s) correctamente`)
    } catch (error) {
      toast.error('Error al subir archivos')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (fileId: string) => {
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter(file => file.id !== fileId)
      onChange(newFiles)
    } else {
      onChange(null)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const renderFiles = () => {
    if (!value) return null

    const files = Array.isArray(value) ? value : [value]
    
    return (
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {file.type.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-8 w-8 object-cover rounded"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                    📄
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => removeFile(file.id)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    )
  }

  if (!isEditing && value) {
    return (
      <div className="w-full">
        {renderFiles()}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-industrial-500 focus:border-transparent transition-colors ${
          dragActive
            ? 'border-industrial-500 bg-industrial-50'
            : 'border-gray-300'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <button
              type="button"
              onClick={openFileDialog}
              className="font-medium text-industrial-600 hover:text-industrial-500"
            >
              Haz clic para subir
            </button>
            {' '}o arrastra y suelta
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, PDF, DOC, XLS hasta 10MB
          </p>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-industrial-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Subiendo archivos...</p>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-4">
          {renderFiles()}
        </div>
      )}
    </div>
  )
}