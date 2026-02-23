// src/components/AnalyticsDashboard/Card.jsx
import React from "react";
import styles from "./AnalyticCard.module.css";

const AnalyticCard = ({ title, value, subtitle, trendLabel, trendValue, trendPositive }) => {
  return (
    <div className={styles.card}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      {trendLabel && (
        <div className={styles.trend}>
          <span
            className={
              trendPositive ? styles.trendPositive : styles.trendNegative
            }
          >
            {trendValue}
          </span>
          <span className={styles.trendLabel}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default AnalyticCard;
