import api from '../api'

export const authAPI = {
  /**
   * Register Owner & Send 4-digit OTP
   * POST /auth/register-owner
   */
  registerOwner: async (data) => {
    const response = await api.post('/auth/register-owner', {
      name: data.fullName,
      shop_name: data.shopName,
      phone_number: data.phoneNumber,
      country_code: data.countryCode || 'NG',
      city: data.city || ''
    })
    return response.data
  },

  /**
   * Verify 4-digit OTP & Get JWT Token
   * POST /auth/verify-otp
   */
  verifyOTP: async (phoneNumber, otp) => {
    const response = await api.post('/auth/verify-otp', {
      phone_number: phoneNumber,
      otp: otp
    })
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
      localStorage.setItem('shopId', response.data.shop?.id)
    }
    
    return response.data
  },

  /**
   * Staff Login via Name + 4-digit PIN
   * POST /auth/login-pin
   */
  staffLogin: async (name, pin) => {
    const response = await api.post('/auth/login-pin', {
      name: name,
      pin: pin
    })
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  /**
   * Link Staff Device using QR Token
   * POST /auth/staff/link
   */
  linkStaffDevice: async (qrToken, name, pin) => {
    const response = await api.post('/auth/staff/link', {
      qr_token: qrToken,
      name: name,
      pin: pin
    })
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  /**
   * Generate Staff Onboarding QR Token (Owner Only)
   * POST /auth/generate-qr
   */
  generateQRCode: async () => {
    const response = await api.post('/auth/generate-qr')
    return response.data
  },

  /**
   * Check QR Code Status with Countdown Timer
   * GET /auth/qr-status/{qr_token}
   */
  checkQRStatus: async (qrToken) => {
    const response = await api.get(`/auth/qr-status/${qrToken}`)
    return response.data
  },

  /**
   * Get SMS Service Status
   * GET /auth/sms-status
   */
  checkSMSStatus: async () => {
    const response = await api.get('/auth/sms-status')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('shopId')
  },
}