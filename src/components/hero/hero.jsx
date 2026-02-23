import { useNavigate } from 'react-router-dom'
import './hero.module.css'
import Button from '../ui/button/button'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <div className='hero-section'>
      <div className='hero-text'>
        <h1>Prevent Inventory Losses Before They Happen</h1>
        <p>
          Smart Loss Control helps shop retailers in Nigeria track losses, 
          identify theft patterns, and empower staff with offline-first tools.
        </p>

        {/* ADD BUTTONS HERE */}
        <div className='hero-button'>
          <Button 
            className='hero-btn register-btn'
            onClick={() => navigate('/owner/register')}
          >
            Register My Shop
          </Button>
          
          <Button 
            className='hero-btn login-btn'
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>
      </div>

      <div className='hero-images'>
        {/* Your images */}
      </div>
    </div>
  )
}