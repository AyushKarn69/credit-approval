import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader, FormField, Button, InfoCard, useToast } from '../components'
import { formatINR } from '../utils/format'
import { registerCustomer } from '../api/endpoints'
import styles from './RegisterCustomer.module.css'

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
}

const VALIDATION_RULES = {
  first_name: v => v.trim().length > 0 || 'First name is required',
  last_name: v => v.trim().length > 0 || 'Last name is required',
  age: v => (v > 0 && v <= 119) || 'Age must be between 1 and 119',
  monthly_income: v => v > 0 || 'Monthly income must be greater than 0',
  phone_number: v => /^\d{10}$/.test(v) || 'Phone number must be exactly 10 digits'
}

export function RegisterCustomer() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    age: '',
    monthly_income: '',
    phone_number: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const data = {
        first_name: form.first_name,
        last_name: form.last_name,
        age: parseInt(form.age),
        monthly_income: parseInt(form.monthly_income),
        phone_number: parseInt(form.phone_number)
      }
      const response = await registerCustomer(data)
      setSuccess(response)
      showToast('Customer registered successfully!', 'success')
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to register customer'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterAnother = () => {
    setSuccess(null)
    setForm({ first_name: '', last_name: '', age: '', monthly_income: '', phone_number: '' })
    setErrors({})
  }

  return (
    <motion.main className={styles.main} {...PAGE_TRANSITION}>
      <div className={styles.container}>
        <PageHeader
          title="Register Customer"
          subtitle="Add a new customer to the system"
        />

        <div className={styles.grid}>
          {/* Left: Decorative Panel */}
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className={styles.panelContent}>
              <p className={styles.panelQuote}>
                "Building credit, one customer at a time."
              </p>
              <div className={styles.features}>
                {[
                  'Instant approval limit calculation',
                  'Secure customer records',
                  'Ready for loan applications'
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className={styles.feature}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                  >
                    <span className={styles.featureCheck}>✓</span>
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Form or Success */}
          <motion.div
            className={styles.formSection}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {!success ? (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.formFields}>
                  <FormField
                    label="First Name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    required
                    index={0}
                  />
                  <FormField
                    label="Last Name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    required
                    index={1}
                  />
                  <FormField
                    label="Age"
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    error={errors.age}
                    required
                    index={2}
                  />
                  <FormField
                    label="Monthly Income"
                    name="monthly_income"
                    type="number"
                    value={form.monthly_income}
                    onChange={handleChange}
                    error={errors.monthly_income}
                    hint="Amount in Indian Rupees"
                    required
                    index={3}
                  />
                  <FormField
                    label="Phone Number"
                    name="phone_number"
                    type="tel"
                    value={form.phone_number}
                    onChange={handleChange}
                    error={errors.phone_number}
                    hint="10-digit mobile number"
                    required
                    index={4}
                  />
                </div>

                <p className={styles.note}>
                  Approved credit limit is automatically calculated as 36× monthly income.
                </p>

                <Button
                  type="submit"
                  loading={loading}
                  variant="primary"
                >
                  Register Customer →
                </Button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={styles.successCard}
              >
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.successTitle}>Customer Registered</h2>
                <div className={styles.customerId}>
                  #{success.customer_id}
                </div>

                <InfoCard
                  items={[
                    { label: 'Name', value: success.name },
                    { label: 'Approved Limit', value: formatINR(success.approved_limit), mono: true },
                    { label: 'Monthly Income', value: formatINR(success.monthly_income), mono: true },
                    { label: 'Phone', value: success.phone_number, mono: true }
                  ]}
                />

                <p className={styles.successNote}>
                  Note your Customer ID—needed for all loan operations.
                </p>

                <Button
                  onClick={handleRegisterAnother}
                  variant="ghost"
                >
                  Register Another Person
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.main>
  )
}
