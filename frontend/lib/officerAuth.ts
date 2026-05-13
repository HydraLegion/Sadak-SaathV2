import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserRole } from '@/lib/types'

/**
 * Officer Authorization Service
 * Validates if a mobile number belongs to an authorized government officer
 * Data comes from Firestore 'authorized_officers' collection
 * Includes demo fallback for testing when Firestore is empty
 */

// Demo officers for testing (fallback when Firestore is empty)
const DEMO_OFFICERS = [
  {
    uid: 'demo-officer-001',
    name: 'Chief Engineer',
    mobile: '9999999999',
    role: 'super_admin' as UserRole,
    district: 'Raipur',
    department: 'PWD',
    isActive: true,
  },
  {
    uid: 'demo-officer-002',
    name: 'District Admin',
    mobile: '8888888888',
    role: 'admin' as UserRole,
    district: 'Raipur',
    department: 'PWD',
    isActive: true,
  },
  {
    uid: 'demo-officer-003',
    name: 'Road Inspector',
    mobile: '6666666666',
    role: 'officer' as UserRole,
    district: 'Raipur',
    department: 'PWD',
    isActive: true,
  },
]

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
  reason?: 'not_found' | 'inactive' | 'invalid_role' | 'error' | 'demo'
  message?: string
}

// Valid officer roles that can access the admin portal
const VALID_ADMIN_ROLES: UserRole[] = ['officer', 'admin', 'super_admin', 'inspector']

/**
 * Check if a mobile number is authorized as a government officer
 * First checks demo officers, then queries Firestore
 */
export async function checkOfficerAuthorization(
  mobileNumber: string
): Promise<AuthorizationResult> {
  try {
    // Clean the mobile number (remove +91, spaces)
    const cleanMobile = mobileNumber.replace(/^\+91/, '').replace(/\s/g, '')

    // First check demo officers (for testing when Firestore is empty)
    const demoOfficer = DEMO_OFFICERS.find(o => o.mobile === cleanMobile)
    if (demoOfficer) {
      console.log('[OfficerAuth] Demo officer authorized:', demoOfficer.name)
      return {
        authorized: true,
        officer: demoOfficer,
        reason: 'demo',
        message: 'Demo account - not from Firestore',
      }
    }

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

    // If Firestore fails, fall back to demo officers
    const cleanMobile = mobileNumber.replace(/^\+91/, '').replace(/\s/g, '')
    const demoOfficer = DEMO_OFFICERS.find(o => o.mobile === cleanMobile)
    if (demoOfficer) {
      console.log('[OfficerAuth] Firestore failed, using demo fallback:', demoOfficer.name)
      return {
        authorized: true,
        officer: demoOfficer,
        reason: 'demo',
        message: 'Demo account (Firestore unavailable)',
      }
    }

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
    // Check if it's a demo officer UID
    const demoOfficer = DEMO_OFFICERS.find(o => o.uid === uid)
    if (demoOfficer) {
      return {
        authorized: true,
        officer: demoOfficer,
        reason: 'demo',
      }
    }

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

    // Check demo officers on error
    const demoOfficer = DEMO_OFFICERS.find(o => o.uid === uid)
    if (demoOfficer) {
      return {
        authorized: true,
        officer: demoOfficer,
        reason: 'demo',
      }
    }

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
    // Return demo officers as fallback
    return DEMO_OFFICERS.filter(o => o.district === district)
  }
}

/**
 * Get all demo officers (for testing UI)
 */
export function getDemoOfficers(): AuthorizedOfficer[] {
  return DEMO_OFFICERS
}
