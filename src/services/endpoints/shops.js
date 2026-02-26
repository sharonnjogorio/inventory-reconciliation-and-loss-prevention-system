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
   * Get Staff List (Owner Only)
   * GET /shops/staff
   */
  getStaffList: async () => {
    const response = await api.get('/shops/staff')
    return response.data
  },

  /**
   * Revoke Staff Access (Owner Only)
   * PATCH /shops/staff/:staff_id/revoke
   */
  revokeStaffAccess: async (staffId) => {
    const response = await api.patch(`/shops/staff/${staffId}/revoke`)
    return response.data
  },

  /**
   * Reactivate Staff Access (Owner Only)
   * PATCH /shops/staff/:staff_id/reactivate
   */
  reactivateStaffAccess: async (staffId) => {
    const response = await api.patch(`/shops/staff/${staffId}/reactivate`)
    return response.data
  },
}