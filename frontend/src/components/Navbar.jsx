import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav>
      <div className="brand">Credit Approval System</div>
      <ul className="nav-links">
        <li>
          <Link
            to="/register"
            className={isActive('/register') ? 'active' : ''}
          >
            Register Customer
          </Link>
        </li>
        <li>
          <Link
            to="/check-eligibility"
            className={isActive('/check-eligibility') ? 'active' : ''}
          >
            Check Eligibility
          </Link>
        </li>
        <li>
          <Link
            to="/create-loan"
            className={isActive('/create-loan') ? 'active' : ''}
          >
            Create Loan
          </Link>
        </li>
        <li>
          <Link
            to="/view-loan"
            className={isActive('/view-loan') ? 'active' : ''}
          >
            View Loan
          </Link>
        </li>
        <li>
          <Link
            to="/view-loans"
            className={isActive('/view-loans') ? 'active' : ''}
          >
            Customer Loans
          </Link>
        </li>
      </ul>
    </nav>
  )
}
