import { Routes, Route } from "react-router-dom";
import './App.css'
import LandingPage from './pages/LandingPage/Landing'
import RegisterPage from "./pages/Owner/Register/Register";
import VerifyPhone from "./pages/Owner/VerifyPhone/VerifyPhone";

function App() {


  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/owner/register" element={<RegisterPage />} />
      <Route path="/verifyPhone" element={<VerifyPhone />} />
    </Routes>
  )
}

export default App
