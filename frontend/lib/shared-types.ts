// Shared types for Sadak Saathi

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}

export interface UploadProgress {
  bytesTransferred: number
  totalBytes: number
  progress: number
}
