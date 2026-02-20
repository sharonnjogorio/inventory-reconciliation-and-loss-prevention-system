
import db from './db'

export const seedMockData = async () => {
  try {
    // Check if staff already exists
    const existingStaff = await db.staff.toCollection().first()
    if (existingStaff) {
      console.log('Mock data already seeded')
      return
    }

    // Seed mock staff (Chinedu)
    await db.staff.add({
      id: 'staff_001',
      name: 'Chinedu',
      pin: '1234', // TEST PIN - In production, this would be a bcrypt hash
      device_id: 'device_test_001',
      shop_id: 'shop_001',
      session_token: 'mock_session_token_abc123'
    })

    // Seed mock inventory
    const mockInventory = [
      {
        id: 'inv_001',
        brand: 'kings',
        size: '5L',
        qty_cartons: 10,
        qty_bottles: 50,
        cost_price: 18500,
        sell_price: 21000,
        last_updated: new Date().toISOString()
      },
      {
        id: 'inv_002',
        brand: 'mamador',
        size: '2L',
        qty_cartons: 8,
        qty_bottles: 40,
        cost_price: 7500,
        sell_price: 8500,
        last_updated: new Date().toISOString()
      },
      {
        id: 'inv_003',
        brand: 'terra',
        size: '1L',
        qty_cartons: 15,
        qty_bottles: 100,
        cost_price: 2800,
        sell_price: 3200,
        last_updated: new Date().toISOString()
      }
    ]

    await db.inventory.bulkAdd(mockInventory)

    console.log('✅ Mock data seeded successfully')
    console.log('📌 Test PIN: 1234')
  } catch (error) {
    console.error('Error seeding mock data:', error)
  }
}

// Clear all data (useful for testing)
export const clearAllData = async () => {
  try {
    await db.staff.clear()
    await db.sessions.clear()
    await db.inventory.clear()
    await db.sales.clear()
    await db.audit_logs.clear()
    await db.sync_queue.clear()
    console.log('✅ All data cleared')
  } catch (error) {
    console.error('Error clearing data:', error)
  }
}
