import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css'

// Landing/Welcome Pages
import LandingPage from './pages/LandingPage/Landing'
import Welcome from './pages/Welcome'

// Owner Pages
import RegisterPage from "./pages/Owner/Register/Register";
import VerifyPhone from "./pages/Owner/VerifyPhone/VerifyPhone";
import Catalog from "./pages/Owner/Catalog/Catalog";
import LoginSelection from './pages/LoginSelection/LoginSelection'
import OwnerLogin from './pages/Owner/OwnerLogin/OwnerLogin'
import OwnerDashboard from './pages/Owner/OwnerDashboard/OwnerDashboard'
import ManageStaff from './pages/Owner/ManageStaff/ManageStaff'
import StaffQRCode from './pages/Owner/StaffQRCode/StaffQRCode'
import ProductCatalog from './pages/Owner/ProductCatalog/ProductCatalog'
import Inventory from './pages/Owner/Inventory/Inventory'
import Settings from './pages/Owner/Settings/Settings'
import AddStock from './pages/Owner/AddStock/AddStock'
import Alerts from './pages/Owner/Alerts/Alerts'
import SalesActivity from './pages/Owner/SalesActivity/SalesActivity'

import AnalyticDashboard from "./pages/Owner/AnalyticDashboard/AnalyticDashboard";
import Report from "./pages/Owner/Report/Report"

// Staff Pages 
import StaffLanding from './features/staff/pages/StaffLanding/StaffLanding'
import StaffPhone from './features/staff/pages/StaffPhone/StaffPhone'
import StaffScan from './features/staff/pages/StaffScan/StaffScan'
import DeviceLinked from './features/staff/pages/DeviceLinked/DeviceLinked'
import StaffPIN from './features/staff/pages/StaffPIN/StaffPIN'
import SalesDashboard from './features/staff/pages/SalesDashboard/SalesDashboard'
import BulkDecant from './features/staff/pages/BulkDecant/BulkDecant'

// Shared Components
import Navbar from './components/navbar/navbar'
import Footer from './components/footer/footer'
import OwnerNavbar from './components/navbar/OwnerNavbar'
// Context
import { CartProvider } from "./components/context/CartProvider";
import OwnerCreatePin from "./pages/Owner/OwnerCreatePin/CreatePin";


function App() {
  const location = useLocation()
  
  // Determine which navbar to show
  const isOwnerRoute = location.pathname.startsWith('/owner') && 
                       location.pathname !== '/owner/register' && 
                       location.pathname !== '/owner/verify' &&
                       location.pathname !== '/owner/login' &&
                       location.pathname !== '/owner/createpin' &&
                       location.pathname !== '/owner/catalog'
  
  const showNavbar = !location.pathname.startsWith('/staff')
  const showFooter = !location.pathname.startsWith('/staff') && !isOwnerRoute
  
  return (
    <CartProvider>
      {isOwnerRoute ? <OwnerNavbar /> : <Navbar />}
      
      

      <Routes>
        {/* Landing - Choose ONE: Welcome or LandingPage */}
        <Route path="/" element={<LandingPage />} />  {/* Using Nafisat's landing */}
        <Route path="/login" element={<LoginSelection />} />
        
        {/* Owner Routes - Nafisat's work */}
        <Route path="/owner/register" element={<RegisterPage />} />
        <Route path="/owner/verify" element={<VerifyPhone />} />
        <Route path="/owner/catalog" element={<ProductCatalog />} />
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/createpin" element={<OwnerCreatePin />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/staff" element={<ManageStaff />} />
        <Route path="/owner/staff/qr-code" element={<StaffQRCode />} />
        <Route path="/owner/inventory" element={<Inventory />} />
        <Route path="/owner/settings" element={<Settings />} />
        <Route path="/owner/inventory/add" element={<AddStock />} />
        <Route path="/owner/alerts" element={<Alerts />} />
        <Route path="/owner/sales-activity" element={<SalesActivity />} />

        {/* Staff Routes - Sharon's work */}
        <Route path="/staff/landing" element={<StaffLanding />} />
        <Route path="/staff/phone" element={<StaffPhone />} />
        <Route path="/staff/scan" element={<StaffScan />} />
        <Route path="/staff/linked" element={<DeviceLinked />} />
        <Route path="/staff/pin" element={<StaffPIN />} />
        <Route path="/staff/sales" element={<SalesDashboard />} />
        <Route path="/staff/bulk-decant" element={<BulkDecant />} />
        <Route path="/staff/landing" element={<StaffLanding />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
         <Route path="/owner/analytics" element={<AnalyticDashboard />} />
      </Routes>
      
      <Footer />
    </CartProvider>
  )
}

export default App