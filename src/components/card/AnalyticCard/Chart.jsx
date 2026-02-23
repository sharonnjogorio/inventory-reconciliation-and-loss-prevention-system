// src/components/AnalyticsDashboard/Charts.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import styles from "./Chart.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className={styles.tooltipRow}>
          <span
            className={styles.tooltipColor}
            style={{ backgroundColor: entry.color }}
          />
          <span className={styles.tooltipKey}>{entry.name}</span>
          <span className={styles.tooltipValue}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const WeeklyLossTrendChart = ({ data }) => {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3>Weekly Loss Trend</h3>
      </div>
      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={24}
              wrapperStyle={{ fontSize: "0.75rem" }}
            />
            <Line
              type="monotone"
              dataKey="losses"
              name="Losses ($)"
              stroke="#FF5E4D"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              name="Sales ($)"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const LossByCategoryChart = ({ data }) => {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3>Loss by Category</h3>
      </div>
      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Losses ($)"
              fill="#E6A767"
              radius={[4, 4, 0, 0]}
              barSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
