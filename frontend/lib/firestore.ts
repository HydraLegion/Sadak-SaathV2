import { DocumentData, FirestoreError, QueryConstraint, addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where, writeBatch, serverTimestamp, DocumentReference } from 'firebase/firestore'
import { db } from './firebase'
import type { ApiResponse } from './types'

// ========================================
// Firestore Service — Sadak Saathi
// ========================================

const COLLECTIONS = {
  USERS: 'users',
  POTHOLES: 'potholes',
  DETECTIONS: 'detections',
  COMPLAINTS: 'complaints',
  JURISDICTIONS: 'jurisdictions',
  DEPARTMENTS: 'departments',
  MEDIA_ASSETS: 'media_assets',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  MODERATION_DECISIONS: 'moderation_decisions',
  REPAIR_UPDATES: 'repair_updates',
  ANALYTICS_CACHE: 'analytics_cache',
} as const

type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]

// Generic CRUD Operations
async function createDocument<T extends DocumentData>(
  collectionName: CollectionName,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<string>> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { success: true, data: docRef.id, error: null }
  } catch (error) {
    return { success: false, data: null, error: formatFirestoreError(error as FirestoreError) }
  }
}

async function getDocument<T extends DocumentData>(
  collectionName: CollectionName,
  id: string
): Promise<ApiResponse<T | null>> {
  try {
    const docSnap = await getDoc(doc(db, collectionName, id))
    if (!docSnap.exists()) {
      return { success: true, data: null, error: null }
    }
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } as unknown as T, error: null }
  } catch (error) {
    return { success: false, data: null, error: formatFirestoreError(error as FirestoreError) }
  }
}

async function updateDocument<T extends DocumentData>(
  collectionName: CollectionName,
  id: string,
  data: Partial<T>
): Promise<ApiResponse<void>> {
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return { success: true, data: undefined, error: null }
  } catch (error) {
    return { success: false, data: null, error: formatFirestoreError(error as FirestoreError) }
  }
}

async function deleteDocument(
  collectionName: CollectionName,
  id: string
): Promise<ApiResponse<void>> {
  try {
    await deleteDoc(doc(db, collectionName, id))
    return { success: true, data: undefined, error: null }
  } catch (error) {
    return { success: false, data: null, error: formatFirestoreError(error as FirestoreError) }
  }
}

// Query Builder with Pagination
interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

async function queryDocuments<T extends DocumentData>(
  collectionName: CollectionName,
  constraints: QueryConstraint[],
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResult<T>>> {
  try {
    // Get all items for count (simplified approach)
    const allQuery = query(collection(db, collectionName), ...constraints)
    const allSnapshot = await getDocs(allQuery)
    const total = allSnapshot.size

    const paginatedQuery = query(
      collection(db, collectionName),
      ...constraints,
      limit(pageSize)
    )

    const querySnapshot = await getDocs(paginatedQuery)
    const items = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T))

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
      error: null,
    }
  } catch (error) {
    return { success: false, data: null, error: formatFirestoreError(error as FirestoreError) }
  }
}

// Batch Operations
async function batchWrite(
  operations: Array<{
    type: 'create' | 'update' | 'delete'
    collection: CollectionName
    id?: string
    data?: DocumentData
  }>
): Promise<ApiResponse<void>> {
  try {
    const batch = writeBatch(db)

    for (const op of operations) {
      const ref = op.id ? doc(db, op.collection, op.id) : doc(collection(db, op.collection))
      switch (op.type) {
        case 'create':
          batch.set(ref, op.data)
          break
        case 'update':
          batch.update(ref, op.data as DocumentData)
          break
        case 'delete':
          batch.delete(ref)
          break
      }
    }

    await batch.commit()
    return { success: true, data: undefined, error: null }
  } catch (error) {
    return { success: false, data: null, error: formatFirestoreError(error as FirestoreError) }
  }
}

// Error Formatter
function formatFirestoreError(error: FirestoreError): { code: string; message: string } {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Incorrect password',
    'firestore/not-found': 'Document not found',
    'firestore/permission-denied': 'Permission denied',
    'firestore/invalid-argument': 'Invalid argument provided',
    'firestore/resource-exhausted': 'Rate limit exceeded',
  }

  return {
    code: error.code,
    message: messages[error.code] || error.message,
  }
}

// Export collection names and specific operations
export {
  COLLECTIONS,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  batchWrite,
  query,
  where,
  orderBy,
  limit,
  collection,
  doc,
  serverTimestamp,
}

export type { CollectionName, DocumentReference }
