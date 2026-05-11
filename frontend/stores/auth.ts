import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { User, UserRole } from '@/lib/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  role: UserRole | null
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => Promise<void>
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean
  loginWithEmail: (email: string, password: string) => Promise<boolean>
  loginWithPhone: (phone: string, captchaVerifier: RecaptchaVerifier) => Promise<string | null>
  verifyOtp: (verificationId: string, otp: string) => Promise<boolean>
  registerUser: (data: RegisterData) => Promise<boolean>
  refreshUserFromFirestore: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  displayName: string
  phone: string
  role: UserRole
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      role: null,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          role: user?.role ?? null,
          isLoading: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      logout: async () => {
        try {
          await signOut(auth)
          set({
            user: null,
            isAuthenticated: false,
            role: null,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      hasPermission: (requiredRole) => {
        const currentRole = get().role
        if (!currentRole) return false

        const roles: UserRole[] = ['citizen', 'inspector', 'officer', 'admin', 'super_admin']
        const currentRoleIndex = roles.indexOf(currentRole)
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        const requiredRoleIndexes = requiredRoles.map((r) => roles.indexOf(r))

        return requiredRoleIndexes.some((rIdx) => rIdx <= currentRoleIndex)
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          const firestoreUser = await getDoc(doc(db, 'users', userCredential.user.uid))

          if (firestoreUser.exists()) {
            const userData = { uid: userCredential.user.uid, ...firestoreUser.data() } as User
            set({ user: userData, isAuthenticated: true, role: userData.role, isLoading: false })
            return true
          } else {
            // Create user document if doesn't exist
            const newUser: Omit<User, 'createdAt' | 'updatedAt'> = {
              uid: userCredential.user.uid,
              email: userCredential.user.email || '',
              phone: userCredential.user.phoneNumber || '',
              displayName: userCredential.user.displayName || email.split('@')[0],
              role: 'citizen',
              jurisdictionId: null,
              departmentId: null,
              photoUrl: null,
              language: 'en',
              lastLoginAt: new Date(),
              isActive: true,
            }
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
            set({ user: newUser as User, isAuthenticated: true, role: 'citizen', isLoading: false })
            return true
          }
        } catch (error: any) {
          const errorMessage = getFirebaseAuthError(error.code)
          set({ error: errorMessage, isLoading: false })
          return false
        }
      },

      loginWithPhone: async (phone, captchaVerifier) => {
        set({ isLoading: true, error: null })
        try {
          const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`
          const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, captchaVerifier)
          set({ isLoading: false })
          return confirmationResult.verificationId
        } catch (error: any) {
          const errorMessage = getFirebaseAuthError(error.code)
          set({ error: errorMessage, isLoading: false })
          return null
        }
      },

      verifyOtp: async (verificationId, otp) => {
        set({ isLoading: true, error: null })
        try {
          // OTP verification would use firebase auth
          // For now, simulate success
          set({ isLoading: false })
          return true
        } catch (error: any) {
          set({ error: 'Invalid OTP', isLoading: false })
          return false
        }
      },

      registerUser: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
          await updateProfile(userCredential.user, { displayName: data.displayName })

          const newUser: Omit<User, 'createdAt' | 'updatedAt'> = {
            uid: userCredential.user.uid,
            email: data.email,
            phone: data.phone,
            displayName: data.displayName,
            role: data.role,
            jurisdictionId: null,
            departmentId: null,
            photoUrl: null,
            language: 'en',
            lastLoginAt: new Date(),
            isActive: true,
          }
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            ...newUser,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          set({ user: newUser as User, isAuthenticated: true, role: data.role, isLoading: false })
          return true
        } catch (error: any) {
          const errorMessage = getFirebaseAuthError(error.code)
          set({ error: errorMessage, isLoading: false })
          return false
        }
      },

      refreshUserFromFirestore: async () => {
        const currentUser = get().user
        if (!currentUser?.uid) return

        try {
          const docSnap = await getDoc(doc(db, 'users', currentUser.uid))
          if (docSnap.exists()) {
            const userData = { uid: currentUser.uid, ...docSnap.data() } as User
            set({ user: userData, role: userData.role })
          }
        } catch (error) {
          console.error('Failed to refresh user:', error)
        }
      },
    }),
    {
      name: 'sadak-saathi-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
)

// Initialize auth state listener
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useAuthStore.getState()
    if (firebaseUser) {
      try {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (docSnap.exists()) {
          const userData = { uid: firebaseUser.uid, ...docSnap.data() } as User
          useAuthStore.setState({ user: userData, isAuthenticated: true, role: userData.role, isLoading: false })
        } else {
          useAuthStore.setState({ user: null, isAuthenticated: false, role: null, isLoading: false })
        }
      } catch {
        useAuthStore.setState({ user: null, isAuthenticated: false, role: null, isLoading: false })
      }
    } else {
      useAuthStore.setState({ user: null, isAuthenticated: false, role: null, isLoading: false })
    }
  })
}

function getFirebaseAuthError(code: string): string {
  const errors: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/code-expired': 'Verification code has expired',
    'auth/network-request-failed': 'Network error. Please check your connection',
  }
  return errors[code] || 'An error occurred. Please try again'
}
