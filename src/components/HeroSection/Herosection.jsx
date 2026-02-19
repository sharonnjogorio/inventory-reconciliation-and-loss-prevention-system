import './HeroSection.css'
import Group from '../../assets/image/Group.png'
import { Link } from 'react-router-dom'
import Button from '../ui/button/button'
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
      <img src={Group} alt="Group" />
    </div>
  </div>
    )
}