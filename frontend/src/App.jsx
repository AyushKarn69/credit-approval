import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import RegisterCustomer from './pages/RegisterCustomer'
import CheckEligibility from './pages/CheckEligibility'
import CreateLoan from './pages/CreateLoan'
import ViewLoan from './pages/ViewLoan'
import ViewCustomerLoans from './pages/ViewCustomerLoans'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterCustomer />} />
        <Route path="/check-eligibility" element={<CheckEligibility />} />
        <Route path="/create-loan" element={<CreateLoan />} />
        <Route path="/view-loan" element={<ViewLoan />} />
        <Route path="/view-loans" element={<ViewCustomerLoans />} />
      </Routes>
    </BrowserRouter>
  )
}
