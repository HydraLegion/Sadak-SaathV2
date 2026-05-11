import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
  setDarkMode: (value: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (value) => set({ isDarkMode: value }),
    }),
    { name: 'theme-storage' }
  )
)

interface UIState {
  sidebarOpen: boolean
  notificationPanelOpen: boolean
  searchQuery: string
  setSidebarOpen: (value: boolean) => void
  setNotificationPanelOpen: (value: boolean) => void
  setSearchQuery: (value: string) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  notificationPanelOpen: false,
  searchQuery: '',
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
  setNotificationPanelOpen: (value) => set({ notificationPanelOpen: value }),
  setSearchQuery: (value) => set({ searchQuery: value }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

interface AuthState {
  user: any
  role: 'citizen' | 'admin' | 'super_admin' | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: any) => void
  setRole: (role: 'citizen' | 'admin' | 'super_admin' | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  logout: () => void
  login: (email: string, password: string, role: 'citizen' | 'admin') => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setIsLoading: (value) => set({ isLoading: value }),
  logout: () => set({ user: null, role: null, isAuthenticated: false }),
  login: async (email, password, role) => {
    set({ isLoading: true })
    // Mock login - in production, this would connect to Firebase
    await new Promise(resolve => setTimeout(resolve, 1000))
    set({
      user: { email, displayName: email.split('@')[0] },
      role,
      isAuthenticated: true,
      isLoading: false,
    })
  },
}))

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  timestamp: Date
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }))
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}))