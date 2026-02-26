import React, { useState, useReducer, useEffect } from "react";
import { Link } from 'react-router-dom'
import styles from "./AnalyticDashboard.module.css";
import AnalyticCard from "../../../components/card/AnalyticCard/AnalyticCard";
import { WeeklyLossTrendChart, LossByCategoryChart } from "../../../components/card/AnalyticCard/Chart";
import AnalyticProduct from "../../../components/card/AnalyticCard/AnalyticProduct";
import RecentStockActivitiesCard from "../../../components/card/AnalyticCard/StockActivities";
import { reportsAPI, dashboardAPI } from '../../../services'


const initialDashboardState = {
  showRevenueTrend: true,
  showLossTrend: true,
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_REVENUE_TREND":
      return { ...state, showRevenueTrend: !state.showRevenueTrend };
    case "TOGGLE_LOSS_TREND":
      return { ...state, showLossTrend: !state.showLossTrend };
    default:
      return state;
  }
}

const AnalyticDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState({
    cards: {
      todayRevenue: { value: "$0", subtitle: "Today's Revenue", trendLabel: "vs yesterday", trendValue: "+0%", trendPositive: true },
      totalRevenue: { value: "$0", subtitle: "Total Revenue / Wk", trendLabel: "vs last week", trendValue: "+0%", trendPositive: true },
      shrinkageRate: { value: "0%", subtitle: "Shrinkage Rate", trendLabel: "vs prev. period", trendValue: "+0%", trendPositive: false },
      totalIncidents: { value: "0", subtitle: "Total Incidents", trendLabel: "0 resolved, 0 open", trendValue: "", trendPositive: true },
      spotChecks: { value: "0", subtitle: "Spot Checks", trendLabel: "0% week‑on‑week", trendValue: "+0%", trendPositive: true },
    },
    weeklyLossTrend: [],
    lossByCategory: [],
  });
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const days = timeRange === '7d' ? 7 : 30
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      // Get today's date range
      const today = new Date()
      const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString()
      
      // Get yesterday's date range for comparison
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString()
      const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString()

      // Fetch real data from backend
      const [salesReport, deviationReport, dashData, todaySales, yesterdaySales] = await Promise.all([
        reportsAPI.getSalesTrendReport({ start_date: startDate, end_date: endDate, group_by: 'day' }),
        reportsAPI.getDeviationReport({ start_date: startDate, end_date: endDate, group_by: 'day' }),
        dashboardAPI.getDashboardOverview(),
        reportsAPI.getSalesTrendReport({ start_date: todayStart, end_date: todayEnd, group_by: 'day' }),
        reportsAPI.getSalesTrendReport({ start_date: yesterdayStart, end_date: yesterdayEnd, group_by: 'day' })
      ])

      // Calculate today's revenue
      const todayRevenue = todaySales.summary?.total_revenue || 0
      const yesterdayRevenue = yesterdaySales.summary?.total_revenue || 0
      const todayTrend = yesterdayRevenue > 0 ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1) : 0

      // Calculate total revenue
      const totalRevenue = salesReport.summary?.total_revenue || 0
      const prevRevenue = salesReport.summary?.prev_period_revenue || totalRevenue
      const revenueTrend = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : 0

      // Calculate shrinkage rate
      const totalLoss = deviationReport.summary?.total_estimated_loss || 0
      const shrinkageRate = totalRevenue > 0 ? ((totalLoss / totalRevenue) * 100).toFixed(1) : 0

      // Get incidents count
      const totalIncidents = deviationReport.summary?.total_incidents || 0
      const resolvedIncidents = deviationReport.summary?.resolved_incidents || 0
      const openIncidents = totalIncidents - resolvedIncidents

      // Get spot checks count
      const spotChecks = deviationReport.summary?.total_audits || 0

      // Build weekly loss trend
      const weeklyLossTrend = salesReport.trend?.map(day => ({
        label: new Date(day.period).toLocaleDateString('en-US', { weekday: 'short' }),
        losses: parseFloat(day.cost || 0),
        sales: parseFloat(day.revenue || 0)
      })) || []

      // Build loss by category
      const lossByCategory = deviationReport.trend?.map(day => ({
        label: new Date(day.period).toLocaleDateString('en-US', { weekday: 'short' }),
        value: parseFloat(day.total_variance || 0)
      })) || []

      setAiData({
        cards: {
          totalRevenue: {
            value: `$${totalRevenue.toFixed(2)}`,
            subtitle: `Total Revenue / ${days}d`,
            trendLabel: "vs last period",
            trendValue: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`,
            trendPositive: revenueTrend >= 0,
          },
          shrinkageRate: {
            value: `${shrinkageRate}%`,
            subtitle: "Shrinkage Rate",
            trendLabel: "vs prev. period",
            trendValue: `$${totalLoss.toFixed(2)} loss`,
            trendPositive: false,
          },
          totalIncidents: {
            value: totalIncidents.toString(),
            subtitle: "Total Incidents",
            trendLabel: `${resolvedIncidents} resolved, ${openIncidents} open`,
            trendValue: "",
            trendPositive: openIncidents === 0,
          },
          spotChecks: {
            value: spotChecks.toString(),
            subtitle: "Spot Checks",
            trendLabel: `${days} day period`,
            trendValue: "",
            trendPositive: true,
          },
        },
        weeklyLossTrend,
        lossByCategory,
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <div className={styles.page}>
      {loading && (
        <div className={styles.loading}>Loading analytics...</div>
      )}
      
      <div className={styles.analyticLink}>
        <Link to="/owner/dashboard" className={styles.breadcrumbLink}><div className={styles.breadcrumb}>{"< Back to Dashboard"}</div></Link>

        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Analytics Dashboard</h1>
            <p className={styles.subtitle}>
              Performance insights and trends
            </p>
          </div>
          <div className={styles.controls}>
            <select
              className={styles.rangeSelect}
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className={styles.primaryButton}>EXPORT REPORT</button>
          </div>
        </div>
        </div>
      <main className={styles.main}>

        <section className={styles.cardsRow}>
          <AnalyticCard
            title="TODAY'S REVENUE"
            value={aiData.cards.todayRevenue.value}
            subtitle=""
            trendLabel={aiData.cards.todayRevenue.trendLabel}
            trendValue={aiData.cards.todayRevenue.trendValue}
            trendPositive={aiData.cards.todayRevenue.trendPositive}
          />
          <AnalyticCard
            title={`TOTAL REVENUE (${timeRange})`}
            value={aiData.cards.totalRevenue.value}
            subtitle=""
            trendLabel={aiData.cards.totalRevenue.trendLabel}
            trendValue={aiData.cards.totalRevenue.trendValue}
            trendPositive={aiData.cards.totalRevenue.trendPositive}
          />
          <AnalyticCard
            title="SHRINKAGE RATE"
            value={aiData.cards.shrinkageRate.value}
            subtitle=""
            trendLabel={aiData.cards.shrinkageRate.trendLabel}
            trendValue={aiData.cards.shrinkageRate.trendValue}
            trendPositive={false}
          />
          <AnalyticCard
            title="TOTAL VARIANCES"
            value={aiData.cards.totalIncidents.value}
            subtitle=""
            trendLabel={aiData.cards.totalIncidents.trendLabel}
            trendValue={aiData.cards.totalIncidents.trendValue}
            trendPositive={true}
          />
          <AnalyticCard
            title="SPOT CHECKS"
            value={aiData.cards.spotChecks.value}
            subtitle=""
            trendLabel={aiData.cards.spotChecks.trendLabel}
            trendValue={aiData.cards.spotChecks.trendValue}
            trendPositive={true}
          />
        </section>

        <section className={styles.chartsRow}>
          {state.showLossTrend && (
            <WeeklyLossTrendChart data={aiData.weeklyLossTrend} />
          )}
          <LossByCategoryChart data={aiData.lossByCategory} />
        </section>

        <section className={styles.bottomRow}>
          <AnalyticProduct/>
          <RecentStockActivitiesCard/>
        </section>
      </main>
    </div>
  );
};

export default AnalyticDashboard;