import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import './App.css'

// Landing
import LandingPage from './pages/LandingPage/Landing'

// Owner Pages
import RegisterPage from "./features/owner/pages/Register/Register";
import VerifyPhone from "./features/owner/pages/VerifyPhone/VerifyPhone";
import LoginSelection from './pages/LoginSelection/LoginSelection'
import OwnerLogin from './features/owner/pages/OwnerLogin/OwnerLogin'
import CreateNewPin from "./features/owner/pages/OwnerForgetPin/CreateNewPin";
import OwnerCreatePin from "./features/owner/pages/OwnerCreatePin/CreatePin";
import OwnerDashboard from './features/owner/pages/OwnerDashboard/OwnerDashboard'
import ManageStaff from './features/owner/pages/ManageStaff/ManageStaff'
import StaffQRCode from './features/owner/pages/StaffQRCode/StaffQRCode'
import ProductCatalog from './features/owner/pages/ProductCatalog/ProductCatalog'
import Inventory from './features/owner/pages/Inventory/Inventory'
import Settings from './features/owner/pages/Settings/Settings'
import AddStock from './features/owner/pages/AddStock/AddStock'
import Alerts from './features/owner/pages/Alerts/Alerts'
import SalesActivity from './features/owner/pages/SalesActivity/SalesActivity'
import AnalyticDashboard from "./features/owner/pages/AnalyticDashboard/AnalyticDashboard";

// Staff Pages
import StaffLanding from './features/staff/pages/StaffLanding/StaffLanding'
import StaffPhone from './features/staff/pages/StaffPhone/StaffPhone'
import StaffScan from './features/staff/pages/StaffScan/StaffScan'
import StaffPIN from './features/staff/pages/StaffPIN/StaffPIN'
import DeviceLinked from './features/staff/pages/DeviceLinked/DeviceLinked'
import SalesDashboard from './features/staff/pages/SalesDashboard/SalesDashboard'
import BulkDecant from './features/staff/pages/BulkDecant/BulkDecant'

// Shared Components
import Navbar from './components/navbar/navbar'
import Footer from './components/footer/footer'
import OwnerNavbar from './components/navbar/OwnerNavbar'
import ScrollToTop from './components/ScrollToTop'
import { CartProvider } from "./context/CartProvider";

function App() {
  const location = useLocation()
  const [navCollapsed, setNavCollapsed] = useState(false)

  const noLayoutRoutes = [
    '/owner/register',
    '/owner/verify',
    '/owner/login',
    '/owner/createpin',
    '/owner/createnewpin',
    '/owner/catalog',
    '/login'
  ]

  const isNoLayout = noLayoutRoutes.includes(location.pathname) ||
                     location.pathname.startsWith('/staff')

  const isOwnerRoute = location.pathname.startsWith('/owner') &&
                       !noLayoutRoutes.includes(location.pathname)

  return (
    <CartProvider>
      <ScrollToTop />
      {!isNoLayout && (isOwnerRoute ? <OwnerNavbar collapsed={navCollapsed} onToggle={() => setNavCollapsed(v => !v)} /> : <Navbar />)}
      <div className={isOwnerRoute ? `ownerContent${navCollapsed ? ' collapsed' : ''}` : ''}>

        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginSelection />} />

          {/* Owner Routes */}
          <Route path="/owner/register" element={<RegisterPage />} />
          <Route path="/owner/verify" element={<VerifyPhone />} />
          <Route path="/owner/catalog" element={<ProductCatalog />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/createpin" element={<OwnerCreatePin />} />
          <Route path="/owner/createnewpin" element={<CreateNewPin />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/staff" element={<ManageStaff />} />
          <Route path="/owner/staff/qr-code" element={<StaffQRCode />} />
          <Route path="/owner/inventory" element={<Inventory />} />
          <Route path="/owner/inventory/add" element={<AddStock />} />
          <Route path="/owner/alerts" element={<Alerts />} />
          <Route path="/owner/sales-activity" element={<SalesActivity />} />
          <Route path="/owner/analytics" element={<AnalyticDashboard />} />
          <Route path="/owner/settings" element={<Settings />} />

          {/* Staff Routes */}
          <Route path="/staff/landing" element={<StaffLanding />} />
          <Route path="/staff/phone" element={<StaffPhone />} />
          <Route path="/staff/scan" element={<StaffScan />} />
          <Route path="/staff/pin" element={<StaffPIN />} />
          <Route path="/staff/linked" element={<DeviceLinked />} />
          <Route path="/staff/sales" element={<SalesDashboard />} />
          <Route path="/staff/bulk-decant" element={<BulkDecant />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {!isNoLayout && !isOwnerRoute && <Footer />}
      </div>
    </CartProvider>
  )
}

export default App
