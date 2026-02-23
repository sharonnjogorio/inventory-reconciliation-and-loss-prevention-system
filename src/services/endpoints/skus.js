import api from '../api'

export const skusAPI = {
  /**
   * List All Available SKUs
   * GET /skus
   */
  getSKUs: async () => {
    const response = await api.get('/skus')
    return response.data
  },
}