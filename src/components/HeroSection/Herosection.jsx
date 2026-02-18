import './HeroSection.css'
import PoweroilImg from '../../assets/image/poweroil.svg?react'
import MamadorImg from '../../assets/image/mamador.svg?react'
import { Link } from 'react-router-dom'
export const HeroSection = ()=>{
    return(
       <div className="hero-section">
    <div className="hero-text">
      <div>
        <h1>Prevent Inventory Losses Before They Happen</h1>
        <p>
          Smart Loss Control helps small retail businesses gain real-time visibility
          into inventory movement, staff activities, and operational patterns
          to reduce preventable losses.
        </p>
      </div>

      <Link to={"/owner/register"}><button>Get Started</button></Link>
    </div>

    <div className="hero-images">
      <PoweroilImg className="poweroil img"/>
      <MamadorImg  className="mamador img"/>
    </div>
  </div>
    )
}