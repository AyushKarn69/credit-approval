import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { path: '/register', label: 'Register' },
  { path: '/check-eligibility', label: 'Check' },
  { path: '/create-loan', label: 'Create Loan' },
  { path: '/view-loan', label: 'View Loan' },
  { path: '/view-loans', label: 'My Loans' }
]

export function Navbar({ theme, onThemeToggle }) {
  const location = useLocation()

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIconBox}></div>
          <div>
            <div className={styles.logoText}>CAS</div>
            <div className={styles.logoSubtext}>Credit Approval System</div>
          </div>
        </Link>

        {/* Nav Links */}
        <div className={styles.navLinks}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={styles.navLink}
              data-active={location.pathname === link.path}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  className={styles.indicator}
                  layoutId="nav-indicator"
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </nav>
  )
}
