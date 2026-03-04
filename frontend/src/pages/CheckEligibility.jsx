import { useState, useEffect } from 'react'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { checkEligibility } from '../api/loans'
import { formatINR } from '../utils/format'

export default function CheckEligibility() {
  useEffect(() => {
    document.title = 'Check Eligibility | Credit Approval System'
  }, [])

  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    interest_rate: '',
    tenure: ''
  })

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer ID is required'
    } else if (parseInt(formData.customer_id) <= 0) {
      newErrors.customer_id = 'Customer ID must be positive'
    }

    if (!formData.loan_amount) {
      newErrors.loan_amount = 'Loan amount is required'
    } else if (parseFloat(formData.loan_amount) <= 0) {
      newErrors.loan_amount = 'Loan amount must be positive'
    }

    if (!formData.interest_rate && formData.interest_rate !== '0') {
      newErrors.interest_rate = 'Interest rate is required'
    } else {
      const rate = parseFloat(formData.interest_rate)
      if (rate < 0 || rate > 100) {
        newErrors.interest_rate = 'Interest rate must be between 0 and 100'
      }
    }

    if (!formData.tenure) {
      newErrors.tenure = 'Tenure is required'
    } else if (parseInt(formData.tenure) <= 0) {
      newErrors.tenure = 'Tenure must be positive'
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
      const data = await checkEligibility(formData)
      setResult(data)
    } catch (error) {
      if (error.response?.status === 404) {
        setApiError(`Customer ID ${formData.customer_id} not found. Please register the customer first.`)
      } else if (error.response) {
        setApiError(error.response.data.detail || 'Error checking eligibility')
      } else {
        setApiError('Could not connect to the server. Make sure the backend is running on port 8000.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      {apiError && (
        <div className="error-box">
          <div className="box-title">Error</div>
          {apiError}
        </div>
      )}

      <div className={result ? 'two-col' : ''}>
        <div className="card" style={{ maxWidth: result ? 'none' : '520px', margin: result ? '0' : '0 auto' }}>
          <div className="card-title">Check Loan Eligibility</div>

          <form onSubmit={handleSubmit} className="form">
            <FormField
              label="Customer ID"
              name="customer_id"
              type="number"
              value={formData.customer_id}
              onChange={handleChange}
              error={errors.customer_id}
              required
            />

            <FormField
              label="Loan Amount"
              name="loan_amount"
              type="number"
              value={formData.loan_amount}
              onChange={handleChange}
              error={errors.loan_amount}
              required
            />

            <FormField
              label="Interest Rate"
              name="interest_rate"
              type="number"
              value={formData.interest_rate}
              onChange={handleChange}
              error={errors.interest_rate}
              hint="Annual rate in %"
              required
            />

            <FormField
              label="Tenure"
              name="tenure"
              type="number"
              value={formData.tenure}
              onChange={handleChange}
              error={errors.tenure}
              hint="Number of months"
              required
            />

            <button type="submit" disabled={loading}>
              {loading && <LoadingSpinner />}
              {loading ? 'Checking...' : 'Check Eligibility'}
            </button>
          </form>
        </div>

        {result && (
          <div className="card" style={{ maxWidth: 'none' }}>
            <div style={{ marginBottom: '16px' }}>
              <StatusBadge approved={result.approval} />
            </div>

            <div className="result-row">
              <div className="result-label">Customer ID</div>
              <div className="result-value">{result.customer_id}</div>
            </div>

            <div className="result-row">
              <div className="result-label">Requested Interest Rate</div>
              <div className="result-value">{result.interest_rate}%</div>
            </div>

            <div className="result-row">
              <div className="result-label">Corrected Interest Rate</div>
              <div className={`result-value ${result.corrected_interest_rate !== result.interest_rate ? 'highlight' : ''}`}>
                {result.corrected_interest_rate}%
              </div>
            </div>

            <div className="result-row">
              <div className="result-label">Tenure</div>
              <div className="result-value">{result.tenure} months</div>
            </div>

            <div className="result-row">
              <div className="result-label">Monthly Installment</div>
              <div className="result-value">{formatINR(result.monthly_installment)}</div>
            </div>

            {result.corrected_interest_rate !== result.interest_rate && (
              <div className="info-box">
                Interest rate adjusted from {result.interest_rate}% to {result.corrected_interest_rate}% based on credit rating.
              </div>
            )}

            {!result.approval && (
              <div className="error-box">
                This loan cannot be approved under the current terms.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
