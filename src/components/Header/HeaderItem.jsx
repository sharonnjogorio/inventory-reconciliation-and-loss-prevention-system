import { Link } from "react-router-dom";
import './HeaderItem.css'

export function HeaderItem({ to, children }) {
  return (
    <li className="header-items">
      <Link
        to={to}
        className="header-item-description"
      >
        {children}
      </Link>
    </li>
  );
}