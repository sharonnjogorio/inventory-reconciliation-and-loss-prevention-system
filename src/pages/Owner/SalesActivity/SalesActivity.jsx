import { useState, useEffect } from 'react'
import { salesAPI } from '../../../services'
import styles from './SalesActivity.module.css'

function SalesActivity() {
  const [loading, setLoading] = useState(false)
  const [sales, setSales] = useState([])
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 50, offset: 0 })
  
  // Filters
  const [dateRange, setDateRange] = useState('today') // today, week, month, custom
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadSalesActivity()
  }, [dateRange, currentPage])

  const loadSalesActivity = async () => {
    setLoading(true)
    try {
      let start, end
      const now = new Date()
      
      switch (dateRange) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0)).toISOString()
          end = new Date(now.setHours(23, 59, 59, 999)).toISOString()
          break
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7)).toISOString()
          end = new Date().toISOString()
          break
        case 'month':
          start = new Date(now.setDate(now.getDate() - 30)).toISOString()
          end = new Date().toISOString()
          break
        case 'custom':
          start = startDate
          end = endDate
          break
      }

      const offset = (currentPage - 1) * 50
      const response = await salesAPI.getSalesHistory(start, end)
      
      if (response.success) {
        setSales(response.sales || [])
        setPagination(response.pagination || { total: 0, pages: 0, limit: 50, offset: 0 })
      }
    } catch (error) {
      console.error('Failed to load sales activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const exportToCSV = () => {
    let csvContent = 'Date & Time,Staff Name,Product,Quantity,Unit Price,Total Amount\n'
    
    sales.forEach(sale => {
      csvContent += `"${formatDateTime(sale.sold_at)}","${sale.staff_name || 'Unknown'}","${sale.brand} ${sale.size}",${sale.quantity},${sale.unit_price},${sale.total_amount}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-activity-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Filter sales by search term
  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      sale.staff_name?.toLowerCase().includes(search) ||
      sale.brand?.toLowerCase().includes(search) ||
      sale.size?.toLowerCase().includes(search)
    )
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sales Activity Log</h1>
        <p className={styles.subtitle}>Detailed transaction history with staff and product information</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Date Range:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.select}
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div className={styles.filterGroup}>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.filterGroup}>
                <label>End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.input}
                />
              </div>
              <button onClick={loadSalesActivity} className={styles.applyBtn}>
                Apply
              </button>
            </>
          )}

          <div className={styles.filterGroup}>
            <label>Search:</label>
            <input
              type="text"
              placeholder="Staff name or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <button onClick={exportToCSV} className={styles.exportBtn} disabled={sales.length === 0}>
          📥 Export CSV
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Transactions</span>
          <span className={styles.statValue}>{filteredSales.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Units Sold</span>
          <span className={styles.statValue}>
            {filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>
            {formatCurrency(filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0))}
          </span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading sales activity...</div>
      ) : filteredSales.length === 0 ? (
        <div className={styles.empty}>
          <p>No sales recorded for this period</p>
          <p className={styles.emptyHint}>Sales will appear here once staff starts logging transactions</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Staff Name</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className={styles.dateTime}>{formatDateTime(sale.sold_at)}</td>
                    <td className={styles.staffName}>{sale.staff_name || 'Unknown'}</td>
                    <td className={styles.product}>{sale.brand} {sale.size}</td>
                    <td className={styles.quantity}>{sale.quantity}</td>
                    <td className={styles.price}>{formatCurrency(sale.unit_price)}</td>
                    <td className={styles.total}>{formatCurrency(sale.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={currentPage === pagination.pages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SalesActivity
