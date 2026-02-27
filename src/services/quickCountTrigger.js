import { aiAPI } from './endpoints/ai'

const TRIGGER_CONFIG = {
  SALES_THRESHOLD: 3,                // Check backend every 3 sales (for demo)
  TIME_THRESHOLD: 4 * 60 * 60 * 1000,  // Check backend every 4 hours
}

/**
 * Check if AI spot check should be triggered
 * Calls backend AI endpoint which uses data science logic
 */
export const shouldTriggerQuickCount = async () => {
  try {
    // Check 1: Sale counter threshold
    const counter = localStorage.getItem('quick_count_sale_counter')
    const count = parseInt(counter || '0')
    
    // Check 2: Time since last check
    const lastCheckTime = localStorage.getItem('quick_count_last_check')
    const timeSince = lastCheckTime ? Date.now() - parseInt(lastCheckTime) : Infinity
    
    // Only call backend if thresholds met (to reduce API calls)
    if (count >= TRIGGER_CONFIG.SALES_THRESHOLD || timeSince > TRIGGER_CONFIG.TIME_THRESHOLD) {
      console.log('🔔 Checking backend for AI trigger...')
      
      // Call backend AI trigger endpoint
      const response = await aiAPI.checkTriggerCount()
      
      if (response.should_trigger) {
        // Reset counters
        localStorage.setItem('quick_count_sale_counter', '0')
        localStorage.setItem('quick_count_last_check', Date.now().toString())
        
        console.log(`🔔 AI Trigger activated: ${response.type} - ${response.reason}`)
        
        return {
          shouldTrigger: true,
          sku: response.sku_to_check,
          reason: response.reason,
          type: response.type
        }
      } else {
        // Update last check time even if no trigger
        localStorage.setItem('quick_count_last_check', Date.now().toString())
        console.log('✅ No trigger needed')
      }
    }

    return { shouldTrigger: false }
  } catch (error) {
    console.error('Error checking Quick Count triggers:', error)
    return { shouldTrigger: false }
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