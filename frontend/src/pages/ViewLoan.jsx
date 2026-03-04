import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader, InfoCard, useToast } from '../components'
import { formatINR, formatRate } from '../utils/format'
import { viewLoan } from '../api/endpoints'
import styles from './ViewLoan.module.css'

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
}

export function ViewLoan() {
  const [loanId, setLoanId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loan, setLoan] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [shakeInput, setShakeInput] = useState(false)
  const showToast = useToast()

  const handleChange = (e) => {
    setLoanId(e.target.value)
    setNotFound(false)
    setShakeInput(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!loanId.trim()) return

    setLoading(true)
    try {
      const response = await viewLoan(loanId)
      setLoan(response)
      setNotFound(false)
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true)
        setShakeInput(true)
        setLoan(null)
      } else {
        const message = err.response?.data?.error || 'Failed to fetch loan details'
        showToast(message, 'error')
        setLoan(null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.main className={styles.main} {...PAGE_TRANSITION}>
      <div className={styles.container}>
        <PageHeader
          title="View Loan"
          subtitle="Look up details for a specific loan"
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
            placeholder="#1234"
            value={loanId}
            onChange={handleChange}
            className={`${styles.searchInput} ${shakeInput ? styles['searchInput--shake'] : ''}`}
          />
          <button type="submit" className={styles.searchButton} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </motion.form>

        {/* Empty State */}
        {!loan && !notFound && !loading && (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyText}>Enter a Loan ID to view details</p>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonHeader} shimmer-skeleton`}></div>
              <div className={styles.skeletonRows}>
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className={`${styles.skeletonRow} shimmer-skeleton`}></div>
                ))}
              </div>
            </div>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonHeader} shimmer-skeleton`}></div>
              <div className={styles.skeletonRows}>
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className={`${styles.skeletonRow} shimmer-skeleton`}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Not Found Error */}
        {notFound && (
          <motion.div
            className={styles.errorCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>Loan #{loanId} not found</p>
            <p className={styles.errorSubtext}>Check the ID and try again</p>
          </motion.div>
        )}

        {/* Results */}
        {loan && (
          <motion.div
            className={styles.resultGrid}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <InfoCard
              title="Loan Details"
              items={[
                { label: 'Loan ID', value: loan.loan_id, mono: true },
                { label: 'Loan Amount', value: formatINR(loan.loan_amount), mono: true },
                { label: 'Interest Rate', value: formatRate(loan.interest_rate) },
                { label: 'Monthly EMI', value: formatINR(loan.monthly_repayment), mono: true },
                { label: 'Tenure', value: `${loan.tenure} months` }
              ]}
            />

            <div className={styles.customerCard}>
              <InfoCard
                title="Customer"
                items={[
                  { label: 'Customer ID', value: loan.customer.id, mono: true },
                  { label: 'Name', value: loan.customer.first_name + ' ' + loan.customer.last_name },
                  { label: 'Phone', value: loan.customer.phone_number, mono: true },
                  { label: 'Age', value: `${loan.customer.age} years` }
                ]}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.main>
  )
}
