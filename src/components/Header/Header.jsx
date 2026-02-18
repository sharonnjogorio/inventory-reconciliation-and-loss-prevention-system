import './Header.css'
import SmartLogo from '../../assets/image/smartlogo.svg?react'
import { HeaderItem } from './HeaderItem'

export default function Header(){
    return(
        <div className='header-wrapper'>
            <div>
                <SmartLogo/>
            </div>
            
            <div className="header-nav">
            <ul className='header-list'>
                <HeaderItem to='/'>Home</HeaderItem>
                <HeaderItem to="/pricing">Pricing</HeaderItem>
                <HeaderItem to="/services">Services</HeaderItem>
                <HeaderItem to="/contact">Contact</HeaderItem>
            </ul>

                <button>Staff Login</button>
            
            </div>
        </div>
    )

}