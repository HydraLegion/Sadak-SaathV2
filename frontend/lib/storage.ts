import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject, StorageReference } from 'firebase/storage'
import { storage } from './firebase'
import type { UploadProgress } from './shared-types'
import type { ApiResponse } from './shared-types'

// ========================================
// Firebase Storage Service — Sadak Saathi
// ========================================

const STORAGE_PATHS = {
  MEDIA: 'media',
  DETECTIONS: 'detections',
  COMPLAINTS: 'complaints',
  USERS: 'users',
  THUMBNAILS: 'thumbnails',
} as const

type StoragePath = typeof STORAGE_PATHS[keyof typeof STORAGE_PATHS]

// Generate unique file path
function generateFilePath(path: StoragePath, userId: string, fileName: string): string {
  const timestamp = Date.now()
  const ext = fileName.split('.').pop()
  return `${path}/${userId}/${timestamp}_${fileName.replace(/\s+/g, '_')}`
}

// Upload file with progress tracking
async function uploadFile(
  file: Blob | Uint8Array,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<ApiResponse<string>> {
  try {
    const storageRef = ref(storage, path)

    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file)

      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            }
            onProgress(progress)
          },
          (error) => {
            resolve({
              success: false,
              data: null,
              error: { code: 'storage-error', message: error.message },
            })
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({ success: true, data: url, error: null })
          }
        )
      })
    }

    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return { success: true, data: url, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { code: 'upload-error', message: (error as Error).message },
    }
  }
}

// Upload image with compression
async function uploadImage(
  file: File,
  path: string,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
  onProgress?: (progress: UploadProgress) => void
): Promise<ApiResponse<string>> {
  try {
    // Compress image
    const compressedBlob = await compressImage(file, maxWidth, maxHeight, quality)
    return uploadFile(compressedBlob, path, onProgress)
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { code: 'compression-error', message: (error as Error).message },
    }
  }
}

// Compress image using canvas
async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Delete file
async function deleteFile(url: string): Promise<ApiResponse<void>> {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
    return { success: true, data: undefined, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { code: 'delete-error', message: (error as Error).message },
    }
  }
}

// Get download URL
async function getFileUrl(path: string): Promise<ApiResponse<string>> {
  try {
    const storageRef = ref(storage, path)
    const url = await getDownloadURL(storageRef)
    return { success: true, data: url, error: null }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { code: 'fetch-error', message: (error as Error).message },
    }
  }
}

export {
  STORAGE_PATHS,
  generateFilePath,
  uploadFile,
  uploadImage,
  deleteFile,
  getFileUrl,
}

export type { StoragePath, StorageReference }
