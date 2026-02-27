import { useState, useEffect, useCallback } from 'react'
import { reportsAPI } from '../../../services'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './Reports.module.css'

const COLORS = ['#DC143C', '#FFC107', '#FF8C00', '#50C878', '#4169E1', '#9370DB']

function Reports() {
  const [activeTab, setActiveTab] = useState('deviation')
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('30')

  const [deviationData, setDeviationData] = useState(null)
  const [salesData, setSalesData] = useState(null)
  const [staffData, setStaffData] = useState(null)
  const [inventoryData, setInventoryData] = useState(null)

  // ✅ wrapped in useCallback so it can be safely added to useEffect deps
  const loadReportData = useCallback(async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString()

      const params = {
        start_date: startDate,
        end_date: endDate,
        group_by: dateRange === '7' ? 'day' : dateRange === '30' ? 'day' : 'week'
      }

      switch (activeTab) {
        case 'deviation': {
          // ✅ wrapped in {} to allow lexical declarations inside case
          const devReport = await reportsAPI.getDeviationReport(params)
          setDeviationData(devReport)
          break
        }
        case 'sales': {
          const salesReport = await reportsAPI.getSalesTrendReport(params)
          setSalesData(salesReport)
          break
        }
        case 'staff': {
          const staffReport = await reportsAPI.getStaffPerformanceReport(params)
          setStaffData(staffReport)
          break
        }
        case 'inventory': {
          const invReport = await reportsAPI.getInventoryTurnoverReport(params)
          setInventoryData(invReport)
          break
        }
        default:
          break
      }
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab, dateRange])

  useEffect(() => {
    loadReportData()
  }, [loadReportData]) // ✅ no more missing dependency warning

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const exportToCSV = () => {
    let csvContent = ''
    let filename = ''

    switch (activeTab) {
      case 'deviation': {
        // ✅ wrapped in {}
        if (!deviationData) return
        filename = `deviation-report-${dateRange}days.csv`
        csvContent = 'Product,Incidents,Avg Deviation %,Total Variance,Estimated Loss\n'
        deviationData.by_product.forEach(p => {
          csvContent += `"${p.brand} ${p.size}",${p.incident_count},${p.avg_deviation_percent},${p.total_variance},${p.estimated_loss}\n`
        })
        break
      }
      case 'sales': {
        if (!salesData) return
        filename = `sales-report-${dateRange}days.csv`
        csvContent = 'Date,Transactions,Units Sold,Revenue,Cost,Profit,Profit Margin\n'
        salesData.trend.forEach(t => {
          csvContent += `${formatDate(t.period)},${t.transaction_count},${t.units_sold},${t.revenue},${t.cost},${t.profit},${t.profit_margin}%\n`
        })
        break
      }
      case 'staff': {
        if (!staffData) return
        filename = `staff-performance-${dateRange}days.csv`
        csvContent = 'Staff Name,Sales,Units Sold,Revenue,Accuracy Score,Critical Incidents\n'
        staffData.staff.forEach(s => {
          csvContent += `"${s.staff_name}",${s.sales.total_sales},${s.sales.units_sold},${s.sales.total_revenue},${s.accuracy.accuracy_score}%,${s.accuracy.critical_incidents}\n`
        })
        break
      }
      case 'inventory': {
        if (!inventoryData) return
        filename = `inventory-turnover-${dateRange}days.csv`
        csvContent = 'Product,Current Stock,Units Sold,Turnover Rate,Days to Sell,Status\n'
        inventoryData.products.forEach(p => {
          csvContent += `"${p.brand} ${p.size}",${p.current_stock},${p.units_sold},${p.turnover_rate},${p.days_to_sell},${p.stock_status}\n`
        })
        break
      }
      default:
        break
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports & Analytics</h1>
          <p className={styles.subtitle}>Business insights and performance metrics</p>
        </div>
        <div className={styles.headerActions}>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={styles.dateSelect}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button onClick={exportToCSV} className={styles.exportBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'deviation' ? styles.active : ''}`} onClick={() => setActiveTab('deviation')}>🚨 Deviation Report</button>
        <button className={`${styles.tab} ${activeTab === 'sales' ? styles.active : ''}`} onClick={() => setActiveTab('sales')}>📊 Sales Trend</button>
        <button className={`${styles.tab} ${activeTab === 'staff' ? styles.active : ''}`} onClick={() => setActiveTab('staff')}>👥 Staff Performance</button>
        <button className={`${styles.tab} ${activeTab === 'inventory' ? styles.active : ''}`} onClick={() => setActiveTab('inventory')}>📦 Inventory Turnover</button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading report...</div>
        ) : (
          <>
            {activeTab === 'deviation' && deviationData && <DeviationReport data={deviationData} formatDate={formatDate} />}
            {activeTab === 'sales' && salesData && <SalesReport data={salesData} formatDate={formatDate} />}
            {activeTab === 'staff' && staffData && <StaffReport data={staffData} />}
            {activeTab === 'inventory' && inventoryData && <InventoryReport data={inventoryData} />}
          </>
        )}
      </div>
    </div>
  )
}

// Deviation Report Component
function DeviationReport({ data, formatDate }) {
  return (
    <div className={styles.report}>
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.summary.total_incidents}</span><span className={styles.summaryLabel}>Total Incidents</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.summary.avg_deviation_percent}%</span><span className={styles.summaryLabel}>Avg Deviation</span></div>
        <div className={`${styles.summaryCard} ${styles.critical}`}><span className={styles.summaryValue}>${data.summary.total_loss}</span><span className={styles.summaryLabel}>Total Loss</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.summary.by_severity.critical}</span><span className={styles.summaryLabel}>Critical Alerts</span></div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Deviation Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#DC143C" name="Incidents" />
            <Line type="monotone" dataKey="avg_deviation_percent" stroke="#FFC107" name="Avg Deviation %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Loss by Product (Top 10)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_product}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="brand" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="estimated_loss" fill="#DC143C" name="Loss ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle}>Detailed Breakdown by Product</h3>
        <table className={styles.table}>
          <thead><tr><th>Product</th><th>Incidents</th><th>Avg Deviation %</th><th>Total Variance</th><th>Estimated Loss</th></tr></thead>
          <tbody>
            {data.by_product.map((product, idx) => (
              <tr key={idx}>
                <td>{product.brand} {product.size}</td>
                <td>{product.incident_count}</td>
                <td>{product.avg_deviation_percent}%</td>
                <td>{product.total_variance} units</td>
                <td className={styles.loss}>${product.estimated_loss}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Sales Report Component
function SalesReport({ data, formatDate }) {
  return (
    <div className={styles.report}>
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>${data.totals.revenue}</span><span className={styles.summaryLabel}>Total Revenue</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>${data.totals.profit}</span><span className={styles.summaryLabel}>Total Profit</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.totals.profit_margin}%</span><span className={styles.summaryLabel}>Profit Margin</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.totals.units_sold}</span><span className={styles.summaryLabel}>Units Sold</span></div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Revenue & Profit Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#4169E1" name="Revenue ($)" />
            <Line type="monotone" dataKey="profit" stroke="#50C878" name="Profit ($)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Units Sold Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Bar dataKey="units_sold" fill="#E29A5C" name="Units Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Staff Report Component
function StaffReport({ data }) {
  return (
    <div className={styles.report}>
      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Staff Sales Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.staff}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="staff_name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales.total_revenue" fill="#4169E1" name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Staff Accuracy Scores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.staff}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="staff_name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="accuracy.accuracy_score" fill="#50C878" name="Accuracy Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle}>Detailed Staff Performance</h3>
        <table className={styles.table}>
          <thead><tr><th>Staff Name</th><th>Sales</th><th>Units Sold</th><th>Revenue</th><th>Accuracy Score</th><th>Critical Incidents</th></tr></thead>
          <tbody>
            {data.staff.map((staff, idx) => (
              <tr key={idx}>
                <td>{staff.staff_name}</td>
                <td>{staff.sales.total_sales}</td>
                <td>{staff.sales.units_sold}</td>
                <td>${staff.sales.total_revenue}</td>
                <td className={parseFloat(staff.accuracy.accuracy_score) >= 95 ? styles.good : styles.warning}>{staff.accuracy.accuracy_score}%</td>
                <td className={staff.accuracy.critical_incidents > 0 ? styles.critical : ''}>{staff.accuracy.critical_incidents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Inventory Report Component
function InventoryReport({ data }) {
  return (
    <div className={styles.report}>
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.summary.total_stock}</span><span className={styles.summaryLabel}>Total Stock</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.summary.total_sold}</span><span className={styles.summaryLabel}>Units Sold</span></div>
        <div className={styles.summaryCard}><span className={styles.summaryValue}>{data.summary.avg_turnover_rate}</span><span className={styles.summaryLabel}>Avg Turnover Rate</span></div>
        <div className={`${styles.summaryCard} ${styles.warning}`}><span className={styles.summaryValue}>{data.summary.low_stock_items}</span><span className={styles.summaryLabel}>Low Stock Items</span></div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Turnover Rate by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.products.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="brand" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="turnover_rate" fill="#9370DB" name="Turnover Rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle}>Inventory Details</h3>
        <table className={styles.table}>
          <thead><tr><th>Product</th><th>Current Stock</th><th>Units Sold</th><th>Turnover Rate</th><th>Days to Sell</th><th>Status</th></tr></thead>
          <tbody>
            {data.products.map((product, idx) => (
              <tr key={idx}>
                <td>{product.brand} {product.size}</td>
                <td>{product.current_stock}</td>
                <td>{product.units_sold}</td>
                <td>{product.turnover_rate}</td>
                <td>{product.days_to_sell}</td>
                <td><span className={`${styles.badge} ${styles[product.stock_status.toLowerCase()]}`}>{product.stock_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports