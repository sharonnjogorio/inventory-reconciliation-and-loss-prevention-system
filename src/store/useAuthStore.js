import { create } from 'zustand'
import { persist } from 'zustand/middleware'


const useAuthStore = create(
  persist(
    (set, get) => ({
      
      user: null,              
      token: null,             
      isAuthenticated: false,  
      sessionStart: null,      
      isOnline: navigator.onLine, 

      // Login as Staff (Chinedu)
      loginStaff: (userData, token) => {
        set({
          user: { ...userData, role: 'staff' },
          token,
          isAuthenticated: true,
          sessionStart: new Date().toISOString()
        })
      },

      // Login as Owner (Amina) - For Nafisat's side
      loginOwner: (userData, token) => {
        set({
          user: { ...userData, role: 'owner' },
          token,
          isAuthenticated: true,
          sessionStart: new Date().toISOString()
        })
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionStart: null
        })
      },

      // Getters - Used everywhere
      isOwner: () => get().user?.role === 'owner',
      isStaff: () => get().user?.role === 'staff',
      getShopId: () => get().user?.shopId,
      getCurrentStaff: () => get().user, // Sales Dashboard needs this
      
      // Network status
      setOnlineStatus: (status) => set({ isOnline: status }),

      // Check if session expired (12 hours from PRD)
      isSessionExpired: () => {
        const { sessionStart } = get()
        if (!sessionStart) return true
        const twelveHours = 12 * 60 * 60 * 1000
        return Date.now() - new Date(sessionStart).getTime() > twelveHours
      }
    }),
    {
      name: 'smart-loss-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sessionStart: state.sessionStart
      })
    }
  )
)

// Listen for online/offline (PWA requirement)
window.addEventListener('online', () => {
  useAuthStore.getState().setOnlineStatus(true)
})

window.addEventListener('offline', () => {
  useAuthStore.getState().setOnlineStatus(false)
})

export default useAuthStore