import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PageHeader, FormField, Button, StatusBadge, useToast } from '../components'
import { formatINR } from '../utils/format'
import { createLoan } from '../api/endpoints'
import styles from './CreateLoan.module.css'

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

// Confetti particle component
function Confetti({ style }) {
  return (
    <motion.div
      className={styles.confetti}
      initial={{ opacity: 1, x: 0, y: 0 }}
      animate={{ opacity: 0, x: style.dx, y: style.dy }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        left: style.startX,
        top: style.startY
      }}
    />
  )
}

export function CreateLoan() {
  const [form, setForm] = useState({
    customer_id: '',
    loan_amount: '',
    interest_rate: '',
    tenure: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [confetti, setConfetti] = useState([])
  const buttonRef = useRef(null)
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
  }

  const triggerConfetti = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const particles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const velocity = 150 + Math.random() * 100
      return {
        id: i,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity - 50,
        startX: centerX,
        startY: centerY
      }
    })

    setConfetti(particles)
    setTimeout(() => setConfetti([]), 1000)
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
      const response = await createLoan(data)
      setResult(response)

      if (response.loan_approved) {
        triggerConfetti()
        showToast('Loan created successfully!', 'success')
      } else {
        showToast('Loan application denied', 'error')
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create loan'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnother = () => {
    setResult(null)
    setForm({ customer_id: '', loan_amount: '', interest_rate: '', tenure: '' })
    setErrors({})
  }

  return (
    <motion.main className={styles.main} {...PAGE_TRANSITION}>
      <div className={styles.container}>
        <PageHeader
          title="Create Loan"
          subtitle="Submit and process a new loan application"
        />

        <div className={styles.card}>
          {!result ? (
            <>
              <div className={styles.notice}>
                <span>⚠</span>
                <span>This action creates a real loan record. Use Check Eligibility first.</span>
              </div>

              <motion.form
                onSubmit={handleSubmit}
                className={styles.form}
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
                  ref={buttonRef}
                  type="submit"
                  loading={loading}
                  variant="primary"
                >
                  Submit Application →
                </Button>
              </motion.form>
            </>
          ) : (
            <motion.div
              className={styles.result}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <StatusBadge approved={result.loan_approved} size="lg" />

              {result.loan_approved ? (
                <div className={styles.approvedContent}>
                  <div className={styles.loanId}>#{result.loan_id}</div>
                  <div className={styles.subtitle}>Loan Successfully Created</div>
                  <div className={styles.emiAmount}>
                    {formatINR(result.monthly_installment)}
                    <span className={styles.emiLabel}>Monthly EMI</span>
                  </div>
                  <p className={styles.successNote}>
                    Record the Loan ID above—needed to view and manage this loan.
                  </p>
                </div>
              ) : (
                <div className={styles.deniedContent}>
                  <div className={styles.deniedReason}>
                    {result.message || 'Loan Application Denied'}
                  </div>
                  <div className={styles.wouldBe}>
                    Monthly EMI would be: <strong>{formatINR(result.monthly_installment)}</strong>
                  </div>
                  <p className={styles.advice}>
                    Adjust terms and try again, or review eligibility first.
                  </p>
                </div>
              )}

              <Button
                onClick={handleCreateAnother}
                variant="ghost"
              >
                {result.loan_approved ? 'Create Another Loan' : 'Try Again'}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confetti particles */}
      {confetti.map(particle => (
        <Confetti key={particle.id} style={particle} />
      ))}
    </motion.main>
  )
}
