import { Routes, Route } from "react-router-dom";
import './App.css'
import LandingPage from './pages/LandingPage/Landing'
import RegisterPage from "./pages/Owner/Register/Register";
import VerifyPhone from "./pages/Owner/VerifyPhone/VerifyPhone";
import Catalog from "./pages/Owner/Catalog/Catalog";
import { CartProvider } from "./components/context/CartContext";
import AnalyticDashboard from "./pages/Owner/AnalyticDashboard/AnalyticDashboard";
import Report from "./pages/Owner/Report/Report"

function App() {


  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/owner/register" element={<RegisterPage />} />
        <Route path="/verifyPhone" element={<VerifyPhone />} />
        <Route path="/product/catalog" element={<Catalog />} />
         <Route path="/analytic/dashboard" element={<AnalyticDashboard />} />
         <Route path="/report/" element={<Report/>} />
      </Routes>
    </CartProvider>
  )
}

export default App
