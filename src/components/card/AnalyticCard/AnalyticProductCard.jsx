// src/components/TopProductsCard/TopProductsCard.jsx
import React, { useState, useReducer, useMemo } from "react";
import styles from "./AnalyticProductCard.module.css";

const fallbackProducts = [
  { id: 1, name: "King's Oil 5L", unitsSold: 127, revenue: 212.01 },
  { id: 2, name: "Mamador 5L", unitsSold: 115, revenue: 179.24 },
  { id: 3, name: "King's Oil 2L", unitsSold: 234, revenue: 140.59 },
  { id: 4, name: "Mamador 2L", unitsSold: 198, revenue: 120.51 },
];

/**
 * Reducer for advanced behavior: sorting + optional filtering
 */
const initialControlState = {
  sortBy: "revenueDesc", // "revenueDesc" | "revenueAsc" | "unitsDesc" | "unitsAsc"
  minUnitsSold: 0,
};

function controlsReducer(state, action) {
  switch (action.type) {
    case "SET_SORT":
      return { ...state, sortBy: action.payload };
    case "SET_MIN_UNITS":
      return { ...state, minUnitsSold: action.payload };
    case "RESET":
      return initialControlState;
    default:
      return state;
  }
}

/**
 * Props:
 * - title?: string
 * - products?: array of { id, name, unitsSold, revenue }
 *   (Pass your API/AI data here; falls back to default when not provided.)
 */
const AnalyticProductCard = ({ title = "Top Products (Revenue)", products }) => {
  // If products prop is not provided or empty, fall back to default static data
  const [localProducts] = useState(
    Array.isArray(products) && products.length > 0
      ? products
      : fallbackProducts
  );

  const [controls, dispatch] = useReducer(
    controlsReducer,
    initialControlState
  );

  // Derived list after sorting + filtering
  const visibleProducts = useMemo(() => {
    let list = [...localProducts];

    // Filter: minimum units sold
    list = list.filter(
      (p) => p.unitsSold >= controls.minUnitsSold
    );

    // Sort
    switch (controls.sortBy) {
      case "revenueAsc":
        list.sort((a, b) => a.revenue - b.revenue);
        break;
      case "revenueDesc":
        list.sort((a, b) => b.revenue - a.revenue);
        break;
      case "unitsAsc":
        list.sort((a, b) => a.unitsSold - b.unitsSold);
        break;
      case "unitsDesc":
        list.sort((a, b) => b.unitsSold - a.unitsSold);
        break;
      default:
        break;
    }

    return list;
  }, [localProducts, controls.sortBy, controls.minUnitsSold]);

  const handleSortChange = (event) => {
    dispatch({ type: "SET_SORT", payload: event.target.value });
  };

  const handleMinUnitsChange = (event) => {
    const value = Number(event.target.value) || 0;
    dispatch({ type: "SET_MIN_UNITS", payload: value });
  };

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <h3 className={styles.header}>{title}</h3>

        {/* Controls (sorting + filter) */}
        <div className={styles.controls}>
          <select
            className={styles.select}
            value={controls.sortBy}
            onChange={handleSortChange}
          >
            <option value="revenueDesc">Revenue: High → Low</option>
            <option value="revenueAsc">Revenue: Low → High</option>
            <option value="unitsDesc">Units Sold: High → Low</option>
            <option value="unitsAsc">Units Sold: Low → High</option>
          </select>

          <div className={styles.minUnitsWrapper}>
            <span className={styles.minUnitsLabel}>Min units:</span>
            <input
              type="number"
              className={styles.minUnitsInput}
              value={controls.minUnitsSold}
              onChange={handleMinUnitsChange}
              min={0}
            />
          </div>

          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      <ul className={styles.list}>
        {visibleProducts.map((product, index) => (
          <li key={product.id ?? index} className={styles.row}>
            <div className={styles.left}>
              <div className={styles.thumbnail} />
              <div className={styles.textBlock}>
                <span className={styles.name}>{product.name}</span>
                <span className={styles.subtitle}>
                  {product.unitsSold} units sold
                </span>
              </div>
            </div>

            <div className={styles.right}>
              <span className={styles.revenue}>
                {`$${Number(product.revenue).toFixed(2)}`}
              </span>
            </div>

            {index < visibleProducts.length - 1 && (
              <div className={styles.divider} />
            )}
          </li>
        ))}

        {visibleProducts.length === 0 && (
          <li className={styles.emptyState}>
            No products match the current filters.
          </li>
        )}
      </ul>
    </div>
  );
};

export default AnalyticProductCard;
