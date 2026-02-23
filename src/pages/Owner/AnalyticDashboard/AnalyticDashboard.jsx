import React, { useState, useReducer, useEffect } from "react";
import { Link } from 'react-router-dom'
import styles from "./AnalyticDashboard.module.css";
import AnalyticCard from "../../../components/card/AnalyticCard/AnalyticCard";
import { WeeklyLossTrendChart, LossByCategoryChart } from "../../../components/card/AnalyticCard/Chart";
import AnalyticProduct from "../../../components/card/AnalyticCard/AnalyticProduct";
import RecentStockActivitiesCard from "../../../components/card/AnalyticCard/StockActivities";


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

const defaultAIData = {
  cards: {
    totalRevenue: {
      value: "$892.74",
      subtitle: "Total Revenue / Wk",
      trendLabel: "vs last week",
      trendValue: "+11.5%",
      trendPositive: true,
    },
    shrinkageRate: {
      value: "2.1%",
      subtitle: "Shrinkage Rate",
      trendLabel: "vs prev. period",
      trendValue: "+0.3%",
      trendPositive: false,
    },
    totalIncidents: {
      value: "5",
      subtitle: "Total Incidents",
      trendLabel: "1 resolved, 2 open",
      trendValue: "",
      trendPositive: true,
    },
    spotChecks: {
      value: "47",
      subtitle: "Spot Checks",
      trendLabel: "15% week‑on‑week",
      trendValue: "+15%",
      trendPositive: true,
    },
  },
  weeklyLossTrend: [
    { label: "Mon", losses: 40, sales: 70 },
    { label: "Tue", losses: 35, sales: 80 },
    { label: "Wed", losses: 50, sales: 90 },
    { label: "Thu", losses: 45, sales: 85 },
    { label: "Fri", losses: 55, sales: 95 },
    { label: "Sat", losses: 48, sales: 88 },
    { label: "Sun", losses: 52, sales: 92 },
  ],
  lossByCategory: [
    { label: "Mon", value: 3 },
    { label: "Tue", value: 4 },
    { label: "Wed", value: 5 },
    { label: "Thu", value: 6 },
    { label: "Fri", value: 7 },
    { label: "Sat", value: 7.5 },
    { label: "Sun", value: 8 },
  ],
};

const AnalyticDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [aiData, setAiData] = useState(defaultAIData);
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  useEffect(() => {
    const runFetch = async () => {
      if (timeRange === "30d") {
        setAiData((prev) => ({
          ...prev,
          cards: {
            ...prev.cards,
            totalRevenue: {
              ...prev.cards.totalRevenue,
              value: "$3,892.74",
              trendValue: "+8.2%",
            },
          },
        }))
      } else {
        setAiData(defaultAIData)
      }
    }
    runFetch()
  }, [timeRange])

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <div className={styles.page}>
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
            title="TOTAL REVENUE (7d)"
            value={aiData.cards.totalRevenue.value}
            subtitle=""
            trendLabel={aiData.cards.totalRevenue.trendLabel}
            trendValue={aiData.cards.totalRevenue.trendValue}
            trendPositive={true}
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