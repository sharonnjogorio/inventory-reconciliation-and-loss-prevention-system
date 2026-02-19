// import { OverlayFooter } from "./OverlayFooter"
// import FooterCard from "./FooterCard"
// import './Footer.css'
// export default function Footer () {
//     return(
//         <>
//                     <ul className='overlay-list'>
//                         <OverlayFooter to='/terms'>Terms of use</OverlayFooter>
//                         <OverlayFooter to="/refund/policy">Refund Policy</OverlayFooter>
//                         <OverlayFooter to="/documentation">Documentation</OverlayFooter>
//                         <OverlayFooter to="/license">License</OverlayFooter>
//                     </ul>

//                      <FooterCard
//                           title="Supporting SDG 8: Decent Work and Economic Growth"
//                           description="© 2026 Smart Loss Control - Next Gen Workforce Team 70"
//                           />
//                     </>
//     )
// }

import React from "react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Top Links */}
      <div className={styles.linkContainer}>
        <Link to="/terms"className={styles.link}> Terms of use</Link>
        <Link to="/refund/policy" className={styles.link}>Refund Policy</Link>
        <Link to="/documentation" className={styles.link}>Documentation</Link>
        <Link to="changelog" className={styles.link}>Changelog</Link>
        <Link to="license" className={styles.link}>License</Link>
      </div>

      {/* Supporting Message */}
      <div className={styles.supportMessage}>
            <p className={styles.supportText}>
        Supporting SDG 8: Decent Work and Economic Growth
      </p>

      {/* Copyright */}
      <p className={styles.copyText}>
        © 2026 Smart Loss Control - Next Gen Workforce Team 70
      </p>
      </div>
      
    </footer>
  );
};

export default Footer;
