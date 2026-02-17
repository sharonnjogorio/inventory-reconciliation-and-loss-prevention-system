import styles from "./input.module.css";

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ""}`}
      />

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Input;
