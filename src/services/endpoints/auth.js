import api from '../api'

export const authAPI = {
  /**
   * Register Owner & Send 4-digit OTP
   * POST /auth/register-owner
   */
 registerOwner: async (data) => {
    const response = await api.post('/auth/register-owner', {
      full_name: data.fullName,
      shop_name: data.shopName,
      phone: data.phoneNumber, 
    })
    return response.data
  },

  

  /**
   * Verify 4-digit OTP & Get JWT Token
   * POST /auth/verify-otp
   */
  verifyOTP: async (phoneNumber, otp) => {
    const response = await api.post('/auth/verify-otp', {
      phone: phoneNumber, 
      otp: otp
    })
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
      localStorage.setItem('shopId', response.data.user?.shop_id)
    }
    
    return response.data
  },

  /**
   * Set 4-digit PIN after OTP verification
   * POST /auth/set-pin
   */
  setPin: async (pin) => {
    const response = await api.post('/auth/set-pin', {
      pin: pin
    })
    return response.data
  },

  /**
   * Owner Login with Phone + PIN (Daily Login)
   * POST /auth/login-owner-pin
   */
  ownerLoginWithPin: async (phone, pin) => {
    const response = await api.post('/auth/login-owner-pin', {
      phone: phone,
      pin: pin
    })
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.user))
      localStorage.setItem('shopId', response.data.user?.shop_id)
    }
    
    return response.data
  },

  /**
   * Get Staff by Phone (for login flow - Step 1)
   * POST /auth/staff/get-by-phone
   */
  getStaffByPhone: async (phone) => {
    const response = await api.post('/auth/staff/get-by-phone', {
      phone: phone
    })
    return response.data
  },

  /**
   * Staff Login via Phone + 4-digit PIN
   * POST /auth/login-pin
   */
  staffLogin: async (phone, pin) => {
    const response = await api.post('/auth/login-pin', {
      phone: phone, 
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
  linkStaffDevice: async (qrToken, deviceId, staffName, phone, pin) => {
    const response = await api.post('/auth/staff/link', {
      qr_token: qrToken,
      device_id: deviceId,  
      staff_name: staffName,
      phone: phone,
      pin: pin
    })
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userData', JSON.stringify(response.data.staff))
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