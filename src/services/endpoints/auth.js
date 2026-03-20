import api from '../api'

export const authAPI = {
  registerOwner: async (data) => {
    const response = await api.post('/auth/register-owner', {
      full_name: data.fullName,
      shop_name: data.shopName,
      phone: data.phoneNumber,
    })
    return response.data
  },

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

  setPin: async (pin) => {
    const response = await api.post('/auth/set-pin', {
      pin: pin
    })
    return response.data
  },

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

  getStaffByPhone: async (phone) => {
    const response = await api.post('/auth/staff/get-by-phone', {
      phone: phone
    })
    return response.data
  },

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

  generateQRCode: async () => {
    const response = await api.post('/auth/generate-qr')
    return response.data
  },

  checkQRStatus: async (qrToken) => {
    const response = await api.get(`/auth/qr-status/${qrToken}`)
    return response.data
  },

  checkSMSStatus: async () => {
    const response = await api.get('/auth/sms-status')
    return response.data
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('shopId')
  },

  

  /**
   * Verify if an OWNER exists using phone number
   * POST /auth/verify-owner-phone
   */
  verifyOwnerPhone: async (phone) => {
    const response = await api.post('/auth/verify-owner-phone', {
      phone: phone
    })
    return response.data
  },

  /**
   * Reset Owner PIN (Create New PIN)
   * POST /auth/reset-owner-pin
   */
 resetOwnerPin: async (phone, newPin) => {
  const response = await api.post('/auth/reset-owner-pin', {
    phone: phone,
    new_pin: newPin
  });
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
    localStorage.setItem('shopId', response.data.user.shop_id);
  }
  return response.data;
}
}