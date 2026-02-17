import './FeatureCard.css'

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="feature-card">
       <img src={Icon} alt="" className="feature-icon" />
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

export default FeatureCard;