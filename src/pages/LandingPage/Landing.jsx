import './Landing.css'
import FeatureCard from '../../components/card/FeatureCard/FeatureCard'
import CheckedIcon from '../../assets/icon/circle-check.svg'
import ChartIcon from '../../assets/icon/chart.svg'
import UserIcon from '../../assets/icon/user.svg'
import TrendIcon from '../../assets/icon/trend.svg'

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

    </div>
  )
}