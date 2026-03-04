import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader, DataTable, useToast } from '../components'
import { formatINR, formatRate } from '../utils/format'
import { viewCustomerLoans } from '../api/endpoints'
import styles from './ViewCustomerLoans.module.css'

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
}

export function ViewCustomerLoans() {
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loans, setLoans] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [shakeInput, setShakeInput] = useState(false)
  const showToast = useToast()

  const handleChange = (e) => {
    setCustomerId(e.target.value)
    setNotFound(false)
    setShakeInput(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!customerId.trim()) return

    setLoading(true)
    try {
      const response = await viewCustomerLoans(customerId)
      setLoans(response)
      setNotFound(false)
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true)
        setShakeInput(true)
        setLoans(null)
      } else {
        const message = err.response?.data?.error || 'Failed to fetch loans'
        showToast(message, 'error')
        setLoans([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary stats
  let stats = null
  if (loans && loans.length > 0) {
    const totalLoans = loans.length
    const totalEmi = loans.reduce((sum, loan) => sum + loan.monthly_repayment, 0)
    const avgRate = loans.reduce((sum, loan) => sum + loan.interest_rate, 0) / loans.length

    stats = {
      totalLoans,
      totalEmi,
      avgRate
    }
  }

  // Prepare table data
  const tableRows = loans ? loans.map(loan => ({
    id: loan.loan_id,
    amount: formatINR(loan.loan_amount),
    rate: formatRate(loan.interest_rate),
    emi: formatINR(loan.monthly_repayment),
    remaining: `${loan.repayments_left} of ${loan.tenure}`
  })) : []

  const tableColumns = [
    { key: 'id', label: 'Loan ID', mono: true },
    { key: 'amount', label: 'Amount', mono: true },
    { key: 'rate', label: 'Rate' },
    { key: 'emi', label: 'Monthly EMI', mono: true },
    { key: 'remaining', label: 'EMIs Remaining' }
  ]

  return (
    <motion.main className={styles.main} {...PAGE_TRANSITION}>
      <div className={styles.container}>
        <PageHeader
          title="Customer Loans"
          subtitle="View all active loans for a customer"
        />

        {/* Search Row */}
        <motion.form
          onSubmit={handleSearch}
          className={styles.searchRow}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <input
            type="text"
            placeholder="Enter Customer ID"
            value={customerId}
            onChange={handleChange}
            className={`${styles.searchInput} ${shakeInput ? styles['searchInput--shake'] : ''}`}
          />
          <button type="submit" className={styles.searchButton} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </motion.form>

        {/* Summary Stats */}
        {stats && (
          <motion.div
            className={styles.statsRow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total Active Loans</span>
              <span className={styles.statValue}>{stats.totalLoans}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total EMI Burden</span>
              <span className={styles.statValue}>{formatINR(stats.totalEmi)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Avg Interest Rate</span>
              <span className={styles.statValue}>{formatRate(stats.avgRate)}</span>
            </div>
          </motion.div>
        )}

        {/* Empty State (no search yet) */}
        {!notFound && loans === null && !loading && (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.emptyIcon}>🔍</div>
            <p className={styles.emptyText}>Enter a Customer ID to view loans</p>
          </motion.div>
        )}

        {/* Not Found Error */}
        {notFound && (
          <motion.div
            className={styles.errorCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>Customer #{customerId} not found</p>
            <p className={styles.errorSubtext}>Check the ID and try again</p>
          </motion.div>
        )}

        {/* Data Table */}
        {loans !== null && !notFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: stats ? 0.3 : 0.1 }}
          >
            {loans.length === 0 ? (
              <motion.div
                className={styles.noLoans}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={styles.noLoansIcon}>✓</div>
                <p>No active loans for Customer #{customerId}</p>
                <p className={styles.noLoansSubtext}>All loans may have been fully repaid</p>
              </motion.div>
            ) : (
              <DataTable
                columns={tableColumns}
                rows={tableRows}
                loading={loading}
              />
            )}
          </motion.div>
        )}
      </div>
    </motion.main>
  )
}
