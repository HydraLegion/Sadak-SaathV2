import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserRole } from '@/lib/types'

/**
 * Officer Authorization Service
 * Validates if a mobile number belongs to an authorized government officer
 * Data comes from Firestore 'authorized_officers' collection
 */

export interface AuthorizedOfficer {
  uid: string
  name: string
  mobile: string
  role: UserRole
  district: string
  department: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthorizationResult {
  authorized: boolean
  officer?: AuthorizedOfficer
  reason?: 'not_found' | 'inactive' | 'invalid_role' | 'error'
  message?: string
}

// Valid officer roles that can access the admin portal
const VALID_ADMIN_ROLES: UserRole[] = ['officer', 'admin', 'super_admin', 'inspector']

/**
 * Check if a mobile number is authorized as a government officer
 * Queries the 'authorized_officers' Firestore collection
 */
export async function checkOfficerAuthorization(
  mobileNumber: string
): Promise<AuthorizationResult> {
  try {
    // Clean the mobile number (remove +91, spaces)
    const cleanMobile = mobileNumber.replace(/^\+91/, '').replace(/\s/g, '')

    // Query Firestore for authorized officers
    const officersRef = collection(db, 'authorized_officers')
    const q = query(
      officersRef,
      where('mobile', '==', cleanMobile)
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return {
        authorized: false,
        reason: 'not_found',
        message: 'Your mobile number is not registered as an authorized officer.',
      }
    }

    // Get the first matching officer
    const officerDoc = snapshot.docs[0]
    const officerData = officerDoc.data()

    // Check if active
    if (!officerData.isActive) {
      return {
        authorized: false,
        reason: 'inactive',
        message: 'Your account is currently inactive. Please contact the administrator.',
      }
    }

    // Validate role
    if (!VALID_ADMIN_ROLES.includes(officerData.role)) {
      return {
        authorized: false,
        reason: 'invalid_role',
        message: 'Your role does not have admin access.',
      }
    }

    return {
      authorized: true,
      officer: {
        uid: officerDoc.id,
        name: officerData.name,
        mobile: officerData.mobile,
        role: officerData.role,
        district: officerData.district,
        department: officerData.department,
        isActive: officerData.isActive,
        createdAt: officerData.createdAt?.toDate(),
        updatedAt: officerData.updatedAt?.toDate(),
      },
    }
  } catch (error) {
    console.error('Authorization check error:', error)
    return {
      authorized: false,
      reason: 'error',
      message: 'Unable to verify authorization. Please try again.',
    }
  }
}

/**
 * Verify officer by UID
 */
export async function verifyOfficerByUid(
  uid: string
): Promise<AuthorizationResult> {
  try {
    const officerDoc = await getDoc(doc(db, 'authorized_officers', uid))

    if (!officerDoc.exists()) {
      return {
        authorized: false,
        reason: 'not_found',
        message: 'Officer record not found.',
      }
    }

    const officerData = officerDoc.data()

    if (!officerData.isActive) {
      return {
        authorized: false,
        reason: 'inactive',
        message: 'Your account is currently inactive.',
      }
    }

    if (!VALID_ADMIN_ROLES.includes(officerData.role)) {
      return {
        authorized: false,
        reason: 'invalid_role',
        message: 'Your role does not have admin access.',
      }
    }

    return {
      authorized: true,
      officer: {
        uid: officerDoc.id,
        ...officerData,
      } as AuthorizedOfficer,
    }
  } catch (error) {
    console.error('Officer verification error:', error)
    return {
      authorized: false,
      reason: 'error',
      message: 'Unable to verify officer. Please try again.',
    }
  }
}

/**
 * Get all active officers for a district
 */
export async function getOfficersByDistrict(
  district: string
): Promise<AuthorizedOfficer[]> {
  try {
    const officersRef = collection(db, 'authorized_officers')
    const q = query(
      officersRef,
      where('district', '==', district),
      where('isActive', '==', true)
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as AuthorizedOfficer[]
  } catch (error) {
    console.error('Error fetching officers:', error)
    return []
  }
}