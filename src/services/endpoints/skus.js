import api from '../api'

export const skusAPI = {
  /**
   * List All Available SKUs
   * GET /inventory/skus
   */
  getSKUs: async () => {
    const response = await api.get('/inventory/skus')
    return response.data
  },
}