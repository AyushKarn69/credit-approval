import { useState, useEffect } from 'react'
import FormField from '../components/FormField'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { createLoan } from '../api/loans'
import { formatINR } from '../utils/format'

export default function CreateLoan() {
  useEffect(() => {
    document.title = 'Create Loan | Credit Approval System'
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
      const data = await createLoan(formData)
      setResult(data)
    } catch (error) {
      if (error.response?.status === 404) {
        setApiError('Customer not found.')
      } else if (error.response) {
        setApiError(error.response.data.detail || 'Error creating loan')
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

      <div className="card centered-card">
        <div className="card-title">Create New Loan</div>

        {!result ? (
          <>
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
                required
              />

              <FormField
                label="Tenure"
                name="tenure"
                type="number"
                value={formData.tenure}
                onChange={handleChange}
                error={errors.tenure}
                required
              />

              <div className="form-note">
                Submitting this form will create the loan if eligible. Use Check Eligibility to preview terms before creating.
              </div>

              <button type="submit" disabled={loading}>
                {loading && <LoadingSpinner />}
                {loading ? 'Creating...' : 'Submit Loan Application'}
              </button>
            </form>
          </>
        ) : result.loan_approved ? (
          <div className="success-box">
            <div style={{ marginBottom: '16px' }}>
              <StatusBadge approved={true} />
            </div>
            <div className="box-title">Loan created successfully</div>
            <div style={{ marginTop: '16px' }}>
              <div className="result-row">
                <div className="result-label">Loan ID</div>
                <div className="result-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>{result.loan_id}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Customer ID</div>
                <div className="result-value">{result.customer_id}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Monthly Installment</div>
                <div className="result-value">{formatINR(result.monthly_repayment)}</div>
              </div>
            </div>
            <div className="info-box" style={{ marginTop: '16px' }}>
              Note your Loan ID: {result.loan_id}
            </div>
            <button
              style={{ marginTop: '16px' }}
              onClick={() => {
                setResult(null)
                setFormData({
                  customer_id: '',
                  loan_amount: '',
                  interest_rate: '',
                  tenure: ''
                })
              }}
            >
              Create Another Loan
            </button>
          </div>
        ) : (
          <div className="error-box">
            <div style={{ marginBottom: '12px' }}>
              <StatusBadge approved={false} />
            </div>
            <div className="box-title">Loan application denied</div>
            <div style={{ marginTop: '12px' }}>
              <div className="result-row">
                <div className="result-label">Customer ID</div>
                <div className="result-value">{result.customer_id}</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '12px', background: '#fff3cd', borderRadius: '3px' }}>
              <strong>Monthly Installment (if approved):</strong> {formatINR(result.monthly_repayment)}
            </div>
            <button
              style={{ marginTop: '16px' }}
              onClick={() => {
                setResult(null)
                setFormData({
                  customer_id: '',
                  loan_amount: '',
                  interest_rate: '',
                  tenure: ''
                })
              }}
            >
              Try Another Application
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
