import './OverlayFooter.css'
import { Link } from "react-router-dom";


export function OverlayFooter({ to, children }) {
  return (
    <li className="overlay-items">
      <Link
        to={to}
        className="overlay-items-description"
      >
        {children}
      </Link>
    </li>
  );
}