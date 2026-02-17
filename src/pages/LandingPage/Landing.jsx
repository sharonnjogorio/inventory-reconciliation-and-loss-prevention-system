import './Landing.css'
import FeatureCard from '../../components/card/FeatureCard/FeatureCard'
import CheckedIcon from '../../assets/icon/circle-check.svg'
import ChartIcon from '../../assets/icon/chart.svg'
import UserIcon from '../../assets/icon/user.svg'
import TrendIcon from '../../assets/icon/trend.svg'
import MetricCard from '../../components/card/WorkingMetricCard/MetricCard'
import FooterCard from '../../components/card/Footer/FooterCard'

export default function LandingPage() {
  return (
    <div className='landing-wrapper'>

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
        </div>
      </section>

      <div className='overlay-footer'></div>

      <FooterCard
      title="Supporting SDG 8: Decent Work and Economic Growth"
      description="© 2026 Smart Loss Control - Next Gen Workforce Team 70"
      />
    </div>
  )
}