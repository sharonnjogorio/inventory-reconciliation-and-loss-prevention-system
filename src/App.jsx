import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css'

// Landing/Welcome Pages
import LandingPage from './pages/LandingPage/Landing'
import Welcome from './pages/Welcome'

// Owner Pages
import RegisterPage from "./pages/Owner/Register/Register";
import VerifyPhone from "./pages/Owner/VerifyPhone/VerifyPhone";
// import Catalog from "./pages/Owner/Catalog/Catalog";
import LoginSelection from './pages/LoginSelection/LoginSelection'
import OwnerLogin from './pages/Owner/OwnerLogin/OwnerLogin'
import CreateNewPin from "./pages/Owner/OwnerForgetPin/CreateNewPin";
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
// import Report from "./pages/Owner/Report/Report"

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
// import InventoryFlow2 from "./pages/Owner/Catalog/InventoryFlow2";


function App() {
  const location = useLocation()

  // Pages that should have NO navbar or footer at all
  const noLayoutRoutes = [
    '/owner/register',
    '/owner/verify',
    '/owner/login',
    '/owner/createpin',
    '/owner/createnewpin',
    'owner/inventory/flow',
    '/owner/catalog',
    '/login'
  ]

  const isNoLayout = noLayoutRoutes.includes(location.pathname) ||
                     location.pathname.startsWith('/staff')

  const isOwnerRoute = location.pathname.startsWith('/owner') && 
                       !noLayoutRoutes.includes(location.pathname)

  return (
    <CartProvider>
      {!isNoLayout && (isOwnerRoute ? <OwnerNavbar /> : <Navbar />)}
      <div style={isOwnerRoute ? { marginLeft: '240px' } : {}}>

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
         {/* <Route path="/owner/inventory/flow" element={<InventoryFlow />} />
         <Route path="/owner/inventory/flow2" element={<InventoryFlow2 />} /> */}
        <Route path="/owner/inventory" element={<Inventory />} />
        <Route path="/owner/settings" element={<Settings />} />
        <Route path="/owner/inventory/add" element={<AddStock />} />
        <Route path="/owner/alerts" element={<Alerts />} />
        <Route path="/owner/sales-activity" element={<SalesActivity />} />
        <Route path="/owner/analytics" element={<AnalyticDashboard />} />

        {/* Staff Routes */}
        <Route path="/staff/landing" element={<StaffLanding />} />
        <Route path="/staff/phone" element={<StaffPhone />} />
        <Route path="/staff/scan" element={<StaffScan />} />
        <Route path="/staff/linked" element={<DeviceLinked />} />
        <Route path="/staff/pin" element={<StaffPIN />} />
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
