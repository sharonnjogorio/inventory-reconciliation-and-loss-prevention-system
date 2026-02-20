import { Link } from 'react-router-dom'
import Button from '../ui/button/button'
import heroImage2 from '../../assets/hero-oil-2.png'
import styles from './hero.module.css'

function Hero() {
  return (
    <section className={styles.hero}>

      {/* ── Left: Text Content ── */}
      <div className={styles.heroLeft}>
        <h1 className={styles.headline}>
          Prevent Inventory Losses <br /> Before They Happen
        </h1>

        <p className={styles.subtext}>
          Smart Loss Control helps small retail businesses gain
          real-time visibility into inventory movement, staff
          activities, and operational patterns to reduce preventable losses.
        </p>

        <div className={styles.heroCta}>
          <Link to="/register">
            <Button variant="primary">Register My Shop</Button>
          </Link>
          <Link to="/services">
            <Button variant="outline">Learn More</Button>
          </Link>
        </div>
      </div>

      {/* ── Right: Oil Bottles Images ── */}
      <div className={styles.heroRight}>
        <img
          src={heroImage2}
          alt="Mamador oil bottles"
          className={styles.heroImage}
        />
      </div>

    </section>
  )
}

export default Hero