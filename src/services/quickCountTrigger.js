import db from './db'

const TRIGGER_CONFIG = {
  SALES_THRESHOLD: 10,               // Trigger every 2 sales
  TIME_THRESHOLD: 4 * 60 * 60 * 1000,  // 4 hours
  RANDOM_PROBABILITY: 0.2,          // 20% chance
}

export const shouldTriggerQuickCount = async () => {
  try {
    // Check 1: Sale counter threshold
    const counter = localStorage.getItem('quick_count_sale_counter')
    const count = parseInt(counter || '0')
    
    if (count >= TRIGGER_CONFIG.SALES_THRESHOLD) {
      localStorage.setItem('quick_count_sale_counter', '0')
      console.log('🔔 Quick Count triggered: Sale counter reached threshold')
      return true
    }

    // Check 2: Time-based trigger
    // const lastCount = await db.audit_logs
    //   .where('type')
    //   .equals('QUICK_COUNT')
    //   .reverse()
    //   .first()

    // if (!lastCount) {
    //   return true // Never done a count - trigger immediately
    // }

    // const timeSince = Date.now() - new Date(lastCount.timestamp).getTime()
    // if (timeSince > TRIGGER_CONFIG.TIME_THRESHOLD) {
    //   console.log('🔔 Quick Count triggered: Time threshold reached')
    //   return true
    // }

    // // Check 3: Random probability
    // const randomTrigger = Math.random() < TRIGGER_CONFIG.RANDOM_PROBABILITY
    // if (randomTrigger) {
    //   console.log('🔔 Quick Count triggered: Random check')
    //   return true
    // }

    // return false
  } catch (error) {
    console.error('Error checking Quick Count triggers:', error)
    return false
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
  try {
    const item = await db.inventory.get(productId)
    return item?.qty_bottles || 50
  } catch (error) {
    console.error('Error getting expected count:', error)
    return 50
  }
}