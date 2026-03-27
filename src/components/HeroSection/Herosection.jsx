import './HeroSection.css'
import { Link } from 'react-router-dom'
import Button from '../ui/button/button'
import mamador from '../../assets/image/mamador.svg'

export const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-text">
        <div>
          <h1>Prevent Inventory Losses Before They Happen</h1>
          <p>
            Smart Loss Control helps small retail businesses gain real-time visibility
            into inventory movement, staff activities and operational patterns
            to reduce preventable losses.
          </p>
        </div>
        <div className='hero-button'>
          <div>
            <Link to={"/owner/register"}><Button>Register My Shop</Button></Link>
          </div>
          <div>
            <Link to={"/owner/register"}><Button variant="outline">Learn More</Button></Link>
          </div>
        </div>
      </div>

      <div className="hero-images">
        <img src={mamador} alt="Mamador Oil" className="hero-product-img" />
      </div>
    </div>
  )
}
