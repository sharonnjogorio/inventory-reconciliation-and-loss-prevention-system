import styles from "./badge.module.css";

function Badge({ count }) {
  if (!count) return null;

  return <span className={styles.badge}>{count}</span>;
}

export default Badge;
