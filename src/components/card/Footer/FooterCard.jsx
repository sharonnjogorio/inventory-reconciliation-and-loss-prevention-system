import './FooterCard.css'

export default function FooterCard ({title, description}){
    return (
        <div className='footer-container'>
            <p className="footer-title"> {title}</p>
            <small className="footer-description">{description}</small>
        </div>
    )
}