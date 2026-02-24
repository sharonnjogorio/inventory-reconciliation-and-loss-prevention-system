import api from '../api'

export const shopsAPI = {
  /**
   * Fetch Current Shop Profile
   * GET /shops/me
   */
  getShopProfile: async () => {
    const response = await api.get('/shops/me')
    return response.data
  },

  /**
   * Revoke Staff Access (Owner Only)
   * PATCH /shops/staff/revoke
   */
  revokeStaffAccess: async (userId) => {
    const response = await api.patch('/shops/staff/revoke', {
      user_id: userId
    })
    return response.data
  },
}