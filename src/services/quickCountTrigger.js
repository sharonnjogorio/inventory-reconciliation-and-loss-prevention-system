import { aiAPI } from './endpoints/ai'

const TRIGGER_CONFIG = {
  SALES_THRESHOLD: 3,                
  TIME_THRESHOLD: 4 * 60 * 60 * 1000,  
}

/**
 * Check if AI spot check should be triggered.
 * Online: delegates to backend AI logic.
 * Offline: falls back to local counter/time thresholds with a random product.
 */
export const shouldTriggerQuickCount = async (products = []) => {
  const counter = localStorage.getItem('quick_count_sale_counter')
  const count = parseInt(counter || '0')
  const lastCheckTime = localStorage.getItem('quick_count_last_check')
  const timeSince = lastCheckTime ? Date.now() - parseInt(lastCheckTime) : Infinity

  const thresholdMet = count >= TRIGGER_CONFIG.SALES_THRESHOLD || timeSince > TRIGGER_CONFIG.TIME_THRESHOLD

  if (!thresholdMet) return { shouldTrigger: false }

  // Online path — let the backend decide
  if (navigator.onLine) {
    try {
      const response = await aiAPI.checkTriggerCount()

      localStorage.setItem('quick_count_last_check', Date.now().toString())

      if (response.should_trigger) {
        localStorage.setItem('quick_count_sale_counter', '0')
        return {
          shouldTrigger: true,
          sku: response.sku_to_check,
          reason: response.reason,
          type: response.type
        }
      }

      return { shouldTrigger: false }
    } catch {
      // API failed — fall through to offline logic below
    }
  }

  // Offline path — trigger locally using a random product
  if (products.length === 0) return { shouldTrigger: false }

  const randomProduct = products[Math.floor(Math.random() * products.length)]

  localStorage.setItem('quick_count_sale_counter', '0')
  localStorage.setItem('quick_count_last_check', Date.now().toString())

  return {
    shouldTrigger: true,
    sku: {
      sku_id: randomProduct.id,
      brand: randomProduct.brand,
      size: randomProduct.size,
      current_stock: randomProduct.quantity
    },
    reason: 'Offline threshold reached',
    type: 'COUNTER'
  }
}

export const incrementSaleCounter = () => {
  const counter = localStorage.getItem('quick_count_sale_counter')
  const count = parseInt(counter || '0')
  localStorage.setItem('quick_count_sale_counter', (count + 1).toString())
  console.log(`📊 Sale counter: ${count + 1}/${TRIGGER_CONFIG.SALES_THRESHOLD}`)
}

export const selectRandomProduct = (products) => {
  return products[Math.floor(Math.random() * products.length)]
}

export const getExpectedCount = async (productId) => {
  // This is now handled by backend, but keep for fallback
  return 50
}