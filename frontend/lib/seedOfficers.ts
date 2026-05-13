/**
 * Seed Script - Add Authorized Officers to Firestore
 *
 * Usage:
 *   node scripts/seedOfficers.js
 *
 * Or import functions directly:
 *   import { addOfficer, seedDefaultOfficers } from './lib/seedOfficers'
 */

import { doc, setDoc, collection, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { UserRole } from './types'

export interface OfficerData {
  uid: string
  name: string
  mobile: string
  role: UserRole
  district: string
  department: string
  isActive: boolean
}

const defaultOfficers: OfficerData[] = [
  {
    uid: 'admin_001',
    name: 'Chief Engineer - Chhattisgarh',
    mobile: '9999999999',
    role: 'super_admin',
    district: 'All India',
    department: 'Ministry of Road Transport',
    isActive: true,
  },
  {
    uid: 'admin_002',
    name: 'District Administrator - Central',
    mobile: '8888888888',
    role: 'admin',
    district: 'Raipur Central',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'admin_003',
    name: 'District Administrator - South',
    mobile: '7777777777',
    role: 'admin',
    district: 'Raipur South',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'officer_001',
    name: 'Road Inspector - Pandri',
    mobile: '6666666666',
    role: 'officer',
    district: 'Raipur Central',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'officer_002',
    name: 'Road Inspector - Shankar Nagar',
    mobile: '5555555555',
    role: 'officer',
    district: 'Raipur South',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'officer_003',
    name: 'NHAI Supervisor - NH-130',
    mobile: '4444444444',
    role: 'officer',
    district: 'Raipur',
    department: 'NHAI',
    isActive: true,
  },
  {
    uid: 'inspector_001',
    name: 'Quality Inspector - North',
    mobile: '3333333333',
    role: 'inspector',
    district: 'Raipur North',
    department: 'PWD-CG',
    isActive: true,
  },
]

/**
 * Add a single officer to Firestore
 */
export async function addOfficer(officer: OfficerData): Promise<boolean> {
  try {
    const officerRef = doc(db, 'authorized_officers', officer.uid)
    await setDoc(officerRef, {
      ...officer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log(`✓ Added officer: ${officer.name} (${officer.mobile})`)
    return true
  } catch (error) {
    console.error(`✗ Failed to add officer: ${officer.name}`, error)
    return false
  }
}

/**
 * Add multiple officers to Firestore
 */
export async function addOfficers(officers: OfficerData[]): Promise<{ added: number; failed: number }> {
  let added = 0
  let failed = 0

  for (const officer of officers) {
    const success = await addOfficer(officer)
    if (success) added++
    else failed++
  }

  return { added, failed }
}

/**
 * Clear all officers from Firestore (use with caution!)
 */
export async function clearAllOfficers(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, 'authorized_officers'))
    let deleted = 0

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'authorized_officers', docSnap.id))
      deleted++
    }

    console.log(`✓ Deleted ${deleted} officers`)
    return deleted
  } catch (error) {
    console.error('✗ Failed to clear officers', error)
    return 0
  }
}

/**
 * Check if an officer exists by mobile
 */
export async function getOfficerByMobile(mobile: string): Promise<OfficerData | null> {
  try {
    const q = query(
      collection(db, 'authorized_officers'),
      where('mobile', '==', mobile.replace(/^\+91/, ''))
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    return { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as OfficerData
  } catch (error) {
    console.error('Error finding officer:', error)
    return null
  }
}

/**
 * Seed default officers (for development/testing)
 */
export async function seedDefaultOfficers(): Promise<{ added: number; failed: number }> {
  console.log('Seeding default officers...\n')

  // Clear existing first
  console.log('Clearing existing officers...')
  await clearAllOfficers()

  console.log('\nAdding default officers...')
  const result = await addOfficers(defaultOfficers)

  console.log(`\n=== Summary ===`)
  console.log(`Added: ${result.added}`)
  console.log(`Failed: ${result.failed}`)

  return result
}

/**
 * Update an officer's mobile number (for re-registration)
 */
export async function updateOfficerMobile(uid: string, newMobile: string): Promise<boolean> {
  try {
    const officerRef = doc(db, 'authorized_officers', uid)
    await setDoc(officerRef, { mobile: newMobile, updatedAt: serverTimestamp() }, { merge: true })
    console.log(`✓ Updated mobile for officer: ${uid}`)
    return true
  } catch (error) {
    console.error(`✗ Failed to update mobile`, error)
    return false
  }
}

/**
 * Deactivate an officer (soft delete)
 */
export async function deactivateOfficer(uid: string): Promise<boolean> {
  try {
    const officerRef = doc(db, 'authorized_officers', uid)
    await setDoc(officerRef, { isActive: false, updatedAt: serverTimestamp() }, { merge: true })
    console.log(`✓ Deactivated officer: ${uid}`)
    return true
  } catch (error) {
    console.error(`✗ Failed to deactivate officer`, error)
    return false
  }
}

/**
 * Reactivate an officer
 */
export async function reactivateOfficer(uid: string): Promise<boolean> {
  try {
    const officerRef = doc(db, 'authorized_officers', uid)
    await setDoc(officerRef, { isActive: true, updatedAt: serverTimestamp() }, { merge: true })
    console.log(`✓ Reactivated officer: ${uid}`)
    return true
  } catch (error) {
    console.error(`✗ Failed to reactivate officer`, error)
    return false
  }
}

// Export default officers for reference
export { defaultOfficers }

// Run directly if executed with node
if (typeof require !== 'undefined' && require.main === module) {
  seedDefaultOfficers()
    .then(() => {
      console.log('\n✓ Seeding complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n✗ Seeding failed:', error)
      process.exit(1)
    })
}