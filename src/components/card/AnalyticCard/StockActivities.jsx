// src/components/RecentStockActivitiesCard/RecentStockActivitiesCard.jsx
import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import styles from "./StockActivities.module.css";

// Example local data – replace via API later
const seedActivities = [
  {
    id: 1,
    type: "Stock Loss",
    typeKey: "loss", // for filtering
    timeAgo: "2 hours ago",
    description: "3 units of Mamador 2L - Breakage during handling",
    user: "Chinedu Okafor",
  },
  {
    id: 2,
    type: "Stock Addition",
    typeKey: "addition",
    timeAgo: "5 hours ago",
    description: "50 units of King's Oil 5L added to inventory",
    user: "Blessing Adeyemi",
  },
  {
    id: 3,
    type: "Stock Loss",
    typeKey: "loss",
    timeAgo: "1 day ago",
    description: "5 units of Golden Penny 1L - Expired products",
    user: "Chinedu Okafor",
  },
];

const initialFilterState = {
  type: "all", // "all" | "loss" | "addition"
  // In a real app you might also have a date range, search text, etc.
};

function filterReducer(state, action) {
  switch (action.type) {
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "RESET":
      return initialFilterState;
    default:
      return state;
  }
}

const RecentStockActivitiesCard = () => {
  // Activities as fetched or loaded
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, dispatch] = useReducer(
    filterReducer,
    initialFilterState
  );

  /**
   * Memoized function to fetch activities.
   * Replace this stub with your real API / AI call.
   */
  const fetchActivities = useCallback(async (currentFilters) => {
    setLoading(true);

    try {
      // Example where you'd call your endpoint:
      //
      // const res = await fetch("https://your-api.com/activities", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(currentFilters),
      // });
      // const json = await res.json();
      // setActivities(json.activities);

      // For now: use local seed data, applying type filter here
      let data = [...seedActivities];
      if (currentFilters.type === "loss") {
        data = data.filter((a) => a.typeKey === "loss");
      } else if (currentFilters.type === "addition") {
        data = data.filter((a) => a.typeKey === "addition");
      }
      // Simulate small delay
      await new Promise((r) => setTimeout(r, 200));
      setActivities(data);
    } catch (err) {
      console.error("Error fetching activities", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchActivities(filters);
  }, [filters, fetchActivities]);

  const handleTypeChange = (event) => {
    dispatch({ type: "SET_TYPE", payload: event.target.value });
  };

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Recent Stock Activities</h3>

        <div className={styles.controls}>
          <select
            value={filters.type}
            onChange={handleTypeChange}
            className={styles.select}
          >
            <option value="all">All</option>
            <option value="loss">Stock Loss</option>
            <option value="addition">Stock Addition</option>
          </select>

          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>Loading activities...</div>
      )}

      {!loading && activities.length === 0 && (
        <div className={styles.empty}>No recent activities.</div>
      )}

      <ul className={styles.list}>
        {!loading &&
          activities.map((activity) => (
            <li key={activity.id} className={styles.item}>
              <div className={styles.timelineBar} />

              <div className={styles.content}>
                <div className={styles.metaRow}>
                  <span
                    className={`${styles.badge} ${
                      activity.typeKey === "loss"
                        ? styles.badgeLoss
                        : styles.badgeAddition
                    }`}
                  >
                    {activity.type}
                  </span>
                  <span className={styles.timeAgo}>
                    {activity.timeAgo}
                  </span>
                </div>

                <div className={styles.description}>
                  {activity.description}
                </div>

                <div className={styles.user}>
                  by {activity.user}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default RecentStockActivitiesCard;
