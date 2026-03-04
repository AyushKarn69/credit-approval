import { useState, useEffect } from 'react'
import FormField from '../components/FormField'
import LoadingSpinner from '../components/LoadingSpinner'
import { registerCustomer } from '../api/loans'
import { formatINR } from '../utils/format'

export default function RegisterCustomer() {
  useEffect(() => {
    document.title = 'Register Customer | Credit Approval System'
  }, [])

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    monthly_income: '',
    phone_number: ''
  })

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else {
      const age = parseInt(formData.age)
      if (age < 1 || age > 119) {
        newErrors.age = 'Age must be between 1 and 119'
      }
    }

    if (!formData.monthly_income) {
      newErrors.monthly_income = 'Monthly income is required'
    } else if (parseInt(formData.monthly_income) <= 0) {
      newErrors.monthly_income = 'Monthly income must be positive'
    }

    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be exactly 10 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await registerCustomer(formData)
      setSuccess(result)
      setFormData({
        first_name: '',
        last_name: '',
        age: '',
        monthly_income: '',
        phone_number: ''
      })
    } catch (error) {
      if (error.response) {
        setApiError(error.response.data.detail || 'Error registering customer')
      } else {
        setApiError('Could not connect to the server. Make sure the backend is running on port 8000.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="card centered-card">
        <div className="card-title">Register New Customer</div>

        {apiError && (
          <div className="error-box">
            <div className="box-title">Error</div>
            {apiError}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="form">
            <FormField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              required
            />

            <FormField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              required
            />

            <FormField
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              required
            />

            <FormField
              label="Monthly Income"
              name="monthly_income"
              type="number"
              value={formData.monthly_income}
              onChange={handleChange}
              error={errors.monthly_income}
              required
            />

            <FormField
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
              required
            />

            <button type="submit" disabled={loading}>
              {loading && <LoadingSpinner />}
              {loading ? 'Registering...' : 'Register Customer'}
            </button>
          </form>
        ) : (
          <div className="success-box">
            <div className="box-title">Customer registered successfully</div>
            <div style={{ marginTop: '16px' }}>
              <div className="result-row">
                <div className="result-label">Customer ID</div>
                <div className="result-value">{success.customer_id}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Name</div>
                <div className="result-value">{success.first_name} {success.last_name}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Approved Limit</div>
                <div className="result-value">{formatINR(success.approved_limit)}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Monthly Income</div>
                <div className="result-value">{formatINR(success.monthly_income)}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Phone</div>
                <div className="result-value">{success.phone_number}</div>
              </div>
            </div>
            <div className="info-box" style={{ marginTop: '16px' }}>
              Save the Customer ID — you will need it for loans.
            </div>
            <button
              style={{ marginTop: '16px' }}
              onClick={() => setSuccess(null)}
            >
              Register Another Customer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
