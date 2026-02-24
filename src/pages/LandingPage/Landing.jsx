import { useNavigate } from 'react-router-dom'
import './Landing.css'
import FeatureCard from '../../components/card/FeatureCard/FeatureCard'
import CheckedIcon from '../../assets/icon/circle-check.svg'
import ChartIcon from '../../assets/icon/chart.svg'
import UserIcon from '../../assets/icon/user.svg'
import TrendIcon from '../../assets/icon/trend.svg'
import MetricCard from '../../components/card/WorkingMetricCard/MetricCard'
import { HeroSection } from '../../components/HeroSection/Herosection'
import Button from '../../components/ui/button/button'

export default function LandingPage() {
  const navigate = useNavigate()

  // ✅ Smart Staff Routing
  const handleStaffClick = () => {
    // Check if staff device is already linked
    const deviceLinked = localStorage.getItem('deviceLinked')
    const staffData = localStorage.getItem('staffData')
    
    if (deviceLinked === 'true' && staffData) {
      // Staff already onboarded → Go directly to PIN login
      console.log('✅ Returning staff → Redirecting to PIN')
      navigate('/staff/pin')
    } else {
      // New staff → Show options (Scan QR or Manual PIN)
      console.log('✅ New staff → Redirecting to landing')
      navigate('/staff/landing')
    }
  }

  // ✅ Smart Owner Routing
  const handleOwnerClick = () => {
    // Check if owner is logged in
    const authToken = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    
    if (authToken && userData) {
      // Owner already logged in → Go to dashboard
      console.log('✅ Logged in owner → Redirecting to dashboard')
      navigate('/owner/dashboard')
    } else {
      // Owner needs to login/register
      console.log('✅ New owner → Redirecting to register')
      navigate('/owner/register')
    }
  }

  return (
    <div className='landing-wrapper'>
      <section style={{ margin: 0, padding: 0 }}>
        <HeroSection/>
      </section>

      <section className='features-wrapper'>
        <div className='features-container'>
          <h2 className="features-heading">Key Features</h2>

          <div className='features-grid'>
            <FeatureCard
              icon={CheckedIcon}
              title="Real-Time Inventory Tracking"
              description="Log Stock Movements instantly with clear reason tags and audit trials."
            />

            <FeatureCard
              icon={ChartIcon}
              title="Loss Analytics & Reports"
              description="View daily and weekly loss summaries with trend analysis"
            />

            <FeatureCard
              icon={UserIcon}
              title="Task Management"
              description="Assign clear tasks with deadlines and track completion rates"
            />

            <FeatureCard
              icon={TrendIcon}
              title="Loss Pattern Detection"
              description="Identify which items, shifts, or times have highest loss rates"
            />
          </div>
        </div>
      </section>

      <section className='metric-wrapper'>
        <div className='metric-container'>
          <h2 className='metric-heading'>How Smart Loss Control Works</h2>

          <div className='metric-grid'>
            <MetricCard
              icon={CheckedIcon}
              description="Create Your store"
            />

            <MetricCard
              icon={CheckedIcon}
              description="Log stock Movement"
            />

            <MetricCard
              icon={CheckedIcon}
              description="Get Instant Loss Alert"
            />
          </div>
        </div>
      </section>

      <section className='prevention-description-wrapper'>
        <div className='prevention-description'>
          <h1>Start Preventing Losses Today</h1>
          <p>Join retail SMEs protecting their profits with data-driven loss prevention</p>
          
          <div className='cta-buttons'>
            {/* ✅ Smart Owner Button */}
            <Button 
              className='prevention-btn register-btn'
              onClick={handleOwnerClick}
            >
              Continue as Owner
            </Button>
            
            {/* ✅ Smart Staff Button */}
            <Button 
              className='prevention-btn login-btn'
              onClick={handleStaffClick}
            >
              Continue as Staff
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}