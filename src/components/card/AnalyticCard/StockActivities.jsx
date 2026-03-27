import React, { useState, useMemo } from "react";
import styles from "./StockActivities.module.css";

const RecentStockActivitiesCard = ({ activities = [], loading = false }) => {
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return activities;
    return activities.filter(a => a.typeKey === typeFilter);
  }, [activities, typeFilter]);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Recent Stock Activities</h3>
        <div className={styles.controls}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All</option>
            <option value="loss">Stock Loss</option>
            <option value="addition">Stock Addition</option>
          </select>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => setTypeFilter("all")}
          >
            Reset
          </button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading activities...</div>}

      {!loading && filtered.length === 0 && (
        <div className={styles.empty}>No recent activities.</div>
      )}

      <ul className={styles.list}>
        {!loading && filtered.map((activity) => (
          <li key={activity.id} className={styles.item}>
            <div className={styles.timelineBar} />
            <div className={styles.content}>
              <div className={styles.metaRow}>
                <span
                  className={`${styles.badge} ${
                    activity.typeKey === "loss" ? styles.badgeLoss : styles.badgeAddition
                  }`}
                >
                  {activity.type}
                </span>
                <span className={styles.timeAgo}>{activity.timeAgo}</span>
              </div>
              <div className={styles.description}>{activity.description}</div>
              <div className={styles.user}>by {activity.user}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentStockActivitiesCard;
