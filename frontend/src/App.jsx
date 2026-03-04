import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useTheme } from './hooks/useTheme'
import { Navbar, ToastProvider } from './components'
import { RegisterCustomer } from './pages/RegisterCustomer'
import { CheckEligibility } from './pages/CheckEligibility'
import { CreateLoan } from './pages/CreateLoan'
import './index.css'
import './animations.css'
import styles from './App.module.css'

// Placeholder pages (to be created in Phase D)
const ViewLoan = () => <div>View Loan</div>
const ViewCustomerLoans = () => <div>My Loans</div>

function App() {
  const [theme, toggleTheme] = useTheme()

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className={styles.app}>
          <Navbar theme={theme} onThemeToggle={toggleTheme} />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/register" replace />} />
              <Route path="/register" element={<RegisterCustomer />} />
              <Route path="/check-eligibility" element={<CheckEligibility />} />
              <Route path="/create-loan" element={<CreateLoan />} />
              <Route path="/view-loan" element={<ViewLoan />} />
              <Route path="/view-loans" element={<ViewCustomerLoans />} />
            </Routes>
          </AnimatePresence>
        </div>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
