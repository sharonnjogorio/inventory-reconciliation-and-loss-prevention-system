import React, { useState, useEffect, useCallback } from "react";
import { Link } from 'react-router-dom'
import styles from "./AnalyticDashboard.module.css";
import AnalyticCard from "../../../../components/card/AnalyticCard/AnalyticCard";
import { WeeklyLossTrendChart, LossByCategoryChart } from "../../../../components/card/AnalyticCard/Chart";
import AnalyticProduct from "../../../../components/card/AnalyticCard/AnalyticProduct";
import RecentStockActivitiesCard from "../../../../components/card/AnalyticCard/StockActivities";
import { reportsAPI, dashboardAPI, alertsAPI } from '../../../../services'

const AnalyticDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState({
    todayRevenue:   { value: "—", trendLabel: "vs yesterday",   trendValue: "",    trendPositive: true },
    totalRevenue:   { value: "—", trendLabel: "vs last period", trendValue: "",    trendPositive: true },
    shrinkageRate:  { value: "—", trendLabel: "vs prev. period",trendValue: "",    trendPositive: false },
    totalIncidents: { value: "—", trendLabel: "0 resolved, 0 open", trendValue: "",trendPositive: true },
    spotChecks:     { value: "—", trendLabel: "",               trendValue: "",    trendPositive: true },
  });
  const [weeklyLossTrend, setWeeklyLossTrend] = useState([]);
  const [lossByCategory, setLossByCategory]   = useState([]);
  const [topProducts, setTopProducts]         = useState([]);
  const [activities, setActivities]           = useState([]);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const endDate   = new Date().toISOString()
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      const today     = new Date()
      const todayStart     = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const todayEnd       = new Date(today.setHours(23, 59, 59, 999)).toISOString()
      const yesterday      = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString()
      const yesterdayEnd   = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString()

      const topPeriod = timeRange === '7d' ? 'week' : 'month'

      const results = await Promise.allSettled([
        reportsAPI.getSalesTrendReport({ start_date: startDate, end_date: endDate, group_by: 'day' }),
        reportsAPI.getDeviationReport({ start_date: startDate, end_date: endDate, group_by: 'day' }),
        reportsAPI.getSalesTrendReport({ start_date: todayStart, end_date: todayEnd, group_by: 'day' }),
        reportsAPI.getSalesTrendReport({ start_date: yesterdayStart, end_date: yesterdayEnd, group_by: 'day' }),
        dashboardAPI.getTopSelling(topPeriod, 5),
        alertsAPI.getAlerts({ limit: 20 }),
      ])

      const resolve = (i, fallback = {}) =>
        results[i].status === 'fulfilled' ? results[i].value : (console.warn(`Analytics API [${i}] failed:`, results[i].reason), fallback)

      const salesReport     = resolve(0)
      const deviationReport = resolve(1)
      const todaySales      = resolve(2)
      const yesterdaySales  = resolve(3)
      const topData         = resolve(4, { success: false, products: [] })
      const alertsData      = resolve(5, { alerts: [] })

      // Today's revenue vs yesterday
      const todayRev     = parseFloat(todaySales.summary?.total_revenue || 0)
      const yesterdayRev = parseFloat(yesterdaySales.summary?.total_revenue || 0)
      const todayTrend   = yesterdayRev > 0
        ? (((todayRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1)
        : 0

      // Period revenue
      const totalRevenue  = parseFloat(salesReport.summary?.total_revenue || 0)
      const prevRevenue   = parseFloat(salesReport.summary?.prev_period_revenue || totalRevenue)
      const revenueTrend  = prevRevenue > 0
        ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
        : 0

      // Shrinkage
      const totalLoss    = parseFloat(deviationReport.summary?.total_estimated_loss || 0)
      const shrinkageRate = totalRevenue > 0 ? ((totalLoss / totalRevenue) * 100).toFixed(1) : 0

      // Incidents
      const totalIncidents    = parseInt(deviationReport.summary?.total_incidents || 0)
      const resolvedIncidents = parseInt(deviationReport.summary?.resolved_incidents || 0)
      const openIncidents     = totalIncidents - resolvedIncidents

      // Spot checks
      const spotChecks = parseInt(deviationReport.summary?.total_audits || 0)

      setCards({
        todayRevenue: {
          value:        formatCurrency(todayRev),
          trendLabel:   'vs yesterday',
          trendValue:   `${todayTrend >= 0 ? '+' : ''}${todayTrend}%`,
          trendPositive: todayTrend >= 0,
        },
        totalRevenue: {
          value:        formatCurrency(totalRevenue),
          trendLabel:   'vs last period',
          trendValue:   `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`,
          trendPositive: revenueTrend >= 0,
        },
        shrinkageRate: {
          value:        `${shrinkageRate}%`,
          trendLabel:   'vs prev. period',
          trendValue:   `${formatCurrency(totalLoss)} loss`,
          trendPositive: false,
        },
        totalIncidents: {
          value:        totalIncidents.toString(),
          trendLabel:   `${resolvedIncidents} resolved, ${openIncidents} open`,
          trendValue:   '',
          trendPositive: openIncidents === 0,
        },
        spotChecks: {
          value:        spotChecks.toString(),
          trendLabel:   `${days}d period`,
          trendValue:   '',
          trendPositive: true,
        },
      })

      setWeeklyLossTrend(
        (salesReport.trend || []).map(day => ({
          label:  new Date(day.period).toLocaleDateString('en-US', { weekday: 'short' }),
          losses: parseFloat(day.cost || 0),
          sales:  parseFloat(day.revenue || 0),
        }))
      )

      setLossByCategory(
        (deviationReport.trend || []).map(day => ({
          label: new Date(day.period).toLocaleDateString('en-US', { weekday: 'short' }),
          value: parseFloat(day.total_variance || 0),
        }))
      )

      // Top products
      if (topData.success && topData.products?.length > 0) {
        setTopProducts(topData.products.map(p => ({
          id:        p.sku_id,
          name:      p.product_name,
          unitsSold: parseInt(p.units_sold || 0),
          revenue:   parseFloat(p.revenue || p.total_revenue || 0),
        })))
      }

      // Stock activities from alerts
      if (alertsData.alerts?.length > 0) {
        setActivities(alertsData.alerts.slice(0, 10).map(alert => ({
          id:          alert.id,
          type:        alert.severity === 'CRITICAL' ? 'Critical Variance' : 'Stock Variance',
          typeKey:     'loss',
          timeAgo:     formatTimeAgo(alert.created_at),
          description: `${alert.brand || ''} ${alert.size || ''} — variance of ${Math.abs(alert.variance || 0)} units, est. loss ${formatCurrency(alert.estimated_loss || 0)}`,
          user:        alert.staff_name || 'Quick Count',
        })))
      } else {
        setActivities([])
      }

    } catch (error) {
      console.error('Failed to load analytics (unexpected):', error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const diffMin = Math.floor((Date.now() - new Date(timestamp)) / 60000)
    if (diffMin < 60)  return `${diffMin}m ago`
    const diffHrs = Math.floor(diffMin / 60)
    if (diffHrs < 24)  return `${diffHrs}h ago`
    return `${Math.floor(diffHrs / 24)}d ago`
  }

  return (
    <div className={styles.page}>
      {loading && <div className={styles.loading}>Loading analytics...</div>}

      <div className={styles.analyticLink}>
        <Link to="/owner/dashboard" className={styles.breadcrumbLink}>
          <div className={styles.breadcrumb}>{"< Back to Dashboard"}</div>
        </Link>

        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Analytics Dashboard</h1>
            <p className={styles.subtitle}>Performance insights and trends</p>
          </div>
          <div className={styles.controls}>
            <select
              className={styles.rangeSelect}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className={styles.primaryButton} onClick={loadAnalyticsData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        <section className={styles.cardsRow}>
          <AnalyticCard title="TODAY'S REVENUE"          {...cards.todayRevenue}   />
          <AnalyticCard title={`TOTAL REVENUE (${timeRange})`} {...cards.totalRevenue}  />
          <AnalyticCard title="SHRINKAGE RATE"           {...cards.shrinkageRate}  trendPositive={false} />
          <AnalyticCard title="TOTAL VARIANCES"          {...cards.totalIncidents} />
          <AnalyticCard title="SPOT CHECKS"              {...cards.spotChecks}     />
        </section>

        <section className={styles.chartsRow}>
          <WeeklyLossTrendChart data={weeklyLossTrend} />
          <LossByCategoryChart  data={lossByCategory}  />
        </section>

        <section className={styles.bottomRow}>
          <AnalyticProduct products={topProducts} loading={loading} />
          <RecentStockActivitiesCard activities={activities} loading={loading} />
        </section>
      </main>
    </div>
  );
};

export default AnalyticDashboard;
