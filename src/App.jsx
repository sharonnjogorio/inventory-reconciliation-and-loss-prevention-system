import { Routes, Route } from "react-router-dom";
import './App.css'
import LandingPage from './pages/LandingPage/Landing'
import RegisterPage from "./pages/Owner/Register/Register";
import VerifyPhone from "./pages/Owner/VerifyPhone/VerifyPhone";
import Catalog from "./pages/Owner/Catalog/Catalog";
import { CartProvider } from "./components/context/CartContext";
import Navbar from './components/navbar/navbar'
import Footer from './components/footer/footer'
import Welcome from './pages/Welcome'
import StaffPIN from './features/staff/pages/StaffPIN/StaffPIN'
import db from './services/db'
import { seedMockData } from './services/mockData'
import StaffLanding from './features/staff/pages/StaffLanding/StaffLanding'
import StaffScan from './features/staff/pages/StaffScan/StaffScan'
import DeviceLinked from './features/staff/pages/DeviceLinked/DeviceLinked'
import SalesDashboard from './features/staff/pages/SalesDashboard/SalesDashboard'
import BulkDecant from './features/staff/pages/BulkDecant/BulkDecant'

function App() {


  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/owner/register" element={<RegisterPage />} />
        <Route path="/verifyPhone" element={<VerifyPhone />} />
        <Route path="/product/catalog" element={<Catalog />} />
      </Routes>
    </CartProvider>
  )
}






function App() {
  return (
    <>
    <Navbar /> {/* Global Navbar */}

    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Welcome />} />

      {/* Staff Flow */}
      <Route path="/staff" element={<StaffLanding />} />
      <Route path="/staff/scan" element={<StaffScan />} />
      <Route path="/staff/linked" element={<DeviceLinked />} />
      <Route path="/staff/pin" element={<StaffPIN />} />
      <Route path="/staff/sales" element={<SalesDashboard />} />
      <Route path="/staff/bulk-decant" element={<BulkDecant />} />

      
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

   
    </Routes>
    <Footer /> {/* Global Footer */}
   </>
  )
}

export default App