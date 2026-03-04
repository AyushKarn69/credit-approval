import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader, FormField, Button, StatusBadge, InfoCard, useToast } from '../components'
import { formatINR, formatRate } from '../utils/format'
import { checkEligibility } from '../api/endpoints'
import styles from './CheckEligibility.module.css'

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
}

const VALIDATION_RULES = {
  customer_id: v => v > 0 || 'Customer ID is required',
  loan_amount: v => v > 0 || 'Loan amount must be greater than 0',
  interest_rate: v => (v >= 0 && v <= 100) || 'Interest rate must be between 0 and 100',
  tenure: v => v > 0 || 'Tenure must be greater than 0'
}

export function CheckEligibility() {
  const [form, setForm] = useState({
    customer_id: '',
    loan_amount: '',
    interest_rate: '',
    tenure: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const showToast = useToast()

  const validate = () => {
    const newErrors = {}
    for (const [key, value] of Object.entries(form)) {
      if (VALIDATION_RULES[key]) {
        const result = VALIDATION_RULES[key](value)
        if (result !== true) {
          newErrors[key] = result
        }
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    setNotFound(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const data = {
        customer_id: parseInt(form.customer_id),
        loan_amount: parseInt(form.loan_amount),
        interest_rate: parseFloat(form.interest_rate),
        tenure: parseInt(form.tenure)
      }
      const response = await checkEligibility(data)
      setResult(response)
      setNotFound(false)
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true)
        setResult(null)
      } else {
        const message = err.response?.data?.error || 'Failed to check eligibility'
        showToast(message, 'error')
        setResult(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const rateAdjusted = result && parseFloat(result.corrected_interest_rate) !== parseFloat(form.interest_rate)

  return (
    <motion.main className={styles.main} {...PAGE_TRANSITION}>
      <div className={styles.container}>
        <PageHeader
          title="Check Eligibility"
          subtitle="Preview loan terms before applying"
        />

        <div className={styles.card}>
          <motion.form
            onSubmit={handleSubmit}
            className={styles.form}
            initial={{ opacity: 1 }}
          >
            <div className={styles.formFields}>
              <FormField
                label="Customer ID"
                name="customer_id"
                type="number"
                value={form.customer_id}
                onChange={handleChange}
                error={errors.customer_id}
                required
                index={0}
              />
              <FormField
                label="Loan Amount"
                name="loan_amount"
                type="number"
                value={form.loan_amount}
                onChange={handleChange}
                error={errors.loan_amount}
                hint="Amount in Indian Rupees"
                required
                index={1}
              />
              <FormField
                label="Interest Rate"
                name="interest_rate"
                type="number"
                step="0.1"
                value={form.interest_rate}
                onChange={handleChange}
                error={errors.interest_rate}
                hint="Annual percentage (%)"
                required
                index={2}
              />
              <FormField
                label="Tenure"
                name="tenure"
                type="number"
                value={form.tenure}
                onChange={handleChange}
                error={errors.tenure}
                hint="Duration in months"
                required
                index={3}
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              variant="primary"
            >
              Check Eligibility →
            </Button>
          </motion.form>

          {notFound && (
            <motion.div
              className={styles.errorCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.errorIcon}>⚠</div>
              <p>Customer #{form.customer_id} not found</p>
              <p className={styles.errorSubtext}>Register them first to proceed</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              className={styles.result}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className={styles.statusRow}>
                <StatusBadge approved={result.approval} size="lg" />
              </div>

              {result.approval ? (
                <>
                  <InfoCard
                    items={[
                      { label: 'Customer ID', value: result.customer_id, mono: true },
                      { label: 'Requested Rate', value: formatRate(form.interest_rate) },
                      { label: 'Corrected Rate', value: formatRate(result.corrected_interest_rate), highlight: rateAdjusted },
                      { label: 'Tenure', value: `${result.tenure} months` },
                      { label: 'Monthly Payment', value: formatINR(result.monthly_installment), mono: true }
                    ]}
                  />

                  {rateAdjusted && (
                    <div className={styles.notice}>
                      <span className={styles.noticeIcon}>⚠</span>
                      <span>
                        Rate adjusted to {result.corrected_interest_rate}% — minimum for your credit tier.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.deniedCard}>
                  <div className={styles.deniedMessage}>Loan Not Eligible</div>
                  <p className={styles.deniedReason}>
                    EMI burden exceeds 50% of monthly salary
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.main>
  )
}
