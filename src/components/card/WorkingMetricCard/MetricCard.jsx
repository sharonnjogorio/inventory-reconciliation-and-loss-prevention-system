import './MetricCard.css'

const MetricCard = ({ icon: Icon, description }) => {
  return (
    <div className="metric-card">
      <img src={Icon} alt="" className="metric-card-icon" />
      <p className="metric-card-description">{description}</p>
    </div>
  );
};

export default MetricCard;