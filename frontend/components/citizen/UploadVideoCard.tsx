'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileVideo, X, CheckCircle, AlertCircle, Loader2,
  Video, Image, ChevronRight, Sparkles, Shield, MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

interface UploadedFile {
  name: string
  size: number
  duration?: string
  preview?: string
}

interface UploadVideoCardProps {
  onUploadComplete?: (file: UploadedFile) => void
  className?: string
}

export default function UploadVideoCard({ onUploadComplete, className }: UploadVideoCardProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validateFile = (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    const maxSize = 500 * 1024 * 1024 // 500MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid video file (MP4, WebM, MOV)')
      return false
    }
    if (file.size > maxSize) {
      setError('File size must be less than 500MB')
      return false
    }
    return true
  }

  const handleFile = useCallback((selectedFile: File) => {
    if (!validateFile(selectedFile)) {
      setStatus('error')
      return
    }

    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      preview: URL.createObjectURL(selectedFile)
    })
    setStatus('uploading')
    setProgress(0)
    setError('')

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + Math.random() * 15
      })
    }, 200)

    // Simulate processing
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setStatus('processing')

      setTimeout(() => {
        setStatus('success')
        onUploadComplete?.(file!)
      }, 2000)
    }, 3000)
  }, [onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const resetUpload = () => {
    setStatus('idle')
    setProgress(0)
    setFile(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 p-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Video className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Upload Road Video</h3>
            <p className="text-sm text-slate-400">AI will detect potholes automatically</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
          <span className="text-xs text-blue-400 font-medium">AI Ready</span>
        </div>
      </div>

      {/* Upload Zone */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer',
              isDragging
                ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleInputChange}
              className="hidden"
            />

            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="mb-4"
            >
              <div className={cn(
                'w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-colors',
                isDragging ? 'bg-blue-500/30' : 'bg-slate-800/50'
              )}>
                <Upload className={cn(
                  'w-7 h-7 transition-colors',
                  isDragging ? 'text-blue-400' : 'text-slate-400'
                )} />
              </div>
            </motion.div>

            <h4 className="text-lg font-medium text-white mb-2">
              {isDragging ? 'Drop video here' : 'Drag & drop your video'}
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              or click to browse files
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                MP4, WebM, MOV
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Image className="w-3 h-3" />
                Max 500MB
              </span>
            </div>
          </motion.div>
        )}

        {/* Uploading State */}
        {(status === 'uploading' || status === 'processing') && file && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* File Preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="w-16 h-16 rounded-xl bg-slate-900/80 overflow-hidden flex-shrink-0 relative">
                {file.preview ? (
                  <video src={file.preview} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  {status === 'uploading' && (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  )}
                  {status === 'processing' && (
                    <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={resetUpload}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">
                  {status === 'uploading' ? 'Uploading...' : 'AI Processing...'}
                </span>
                <span className="text-sm text-blue-400 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={cn(
                    'h-full rounded-full',
                    status === 'uploading'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  )}
                />
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-2">
              <ProcessingStep label="Video uploaded" done={progress >= 100} />
              <ProcessingStep label="Analyzing frames" done={progress >= 60} active={progress >= 60 && progress < 100} />
              <ProcessingStep label="Detecting potholes" done={status === ('success' as UploadStatus)} active={status === ('processing' as UploadStatus)} />
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && file && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="p-3 rounded-xl bg-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-400">Video Processed Successfully!</p>
                <p className="text-sm text-slate-400 mt-1">5 potholes detected in your video</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <p className="text-2xl font-bold text-orange-400">2</p>
                <p className="text-xs text-slate-400">Dangerous</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <p className="text-2xl font-bold text-yellow-400">1</p>
                <p className="text-xs text-slate-400">Moderate</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <p className="text-2xl font-bold text-green-400">2</p>
                <p className="text-xs text-slate-400">Minor</p>
              </div>
            </div>

            <button
              onClick={resetUpload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Another Video
            </button>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <div className="p-3 rounded-xl bg-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-400">Upload Failed</p>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
            <button
              onClick={resetUpload}
              className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features */}
      <div className="mt-6 pt-6 border-t border-slate-800/50 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xs text-slate-400">Secure Upload</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xs text-slate-400">AI Analysis</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-xs text-slate-400">GPS Tagged</p>
        </div>
      </div>
    </motion.div>
  )
}

function ProcessingStep({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
        done ? 'bg-green-500/20' : active ? 'bg-blue-500/20' : 'bg-slate-800/50'
      )}>
        {done && <CheckCircle className="w-4 h-4 text-green-400" />}
        {active && !done && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
        {!done && !active && <div className="w-2 h-2 rounded-full bg-slate-600" />}
      </div>
      <span className={cn(
        'text-sm',
        done ? 'text-green-400' : active ? 'text-blue-400' : 'text-slate-500'
      )}>
        {label}
      </span>
    </div>
  )
}
