import styles from "./button.module.css";

function Button({
  variant = "primary",
  children,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${fullWidth ? styles.fullWidth : ""}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
