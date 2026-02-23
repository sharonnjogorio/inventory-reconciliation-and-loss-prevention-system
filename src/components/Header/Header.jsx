import { useNavigate } from 'react-router-dom'
import './Header.css'
import SmartLogo from '../../assets/image/smartlogo.svg?react'
import { HeaderItem } from './HeaderItem'
import Button from '../ui/button/button'

export default function Header() {
    const navigate = useNavigate()

    return (
        <div className='header-wrapper'>
            <div>
                <SmartLogo />
            </div>
            
            <div className="header-nav">
                <ul className='header-list'>
                    <HeaderItem to='/'>Home</HeaderItem>
                    <HeaderItem to="/pricing">Pricing</HeaderItem>
                    <HeaderItem to="/services">Services</HeaderItem>
                    <HeaderItem to="/contact">Contact</HeaderItem>
                </ul>
                
                <Button 
                    className='header-button'
                    variant='primary'
                    onClick={() => navigate('/staff')}
                >
                    Staff Login
                </Button>
            </div>
        </div>
    )
}