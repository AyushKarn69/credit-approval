import { useState, useEffect } from 'react'
import FormField from '../components/FormField'
import LoadingSpinner from '../components/LoadingSpinner'
import { viewLoan } from '../api/loans'
import { formatINR } from '../utils/format'

export default function ViewLoan() {
  useEffect(() => {
    document.title = 'View Loan | Credit Approval System'
  }, [])

  const [loanId, setLoanId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loan, setLoan] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')

    if (!loanId || parseInt(loanId) <= 0) {
      setError('Please enter a valid Loan ID')
      return
    }

    setLoading(true)
    try {
      const data = await viewLoan(loanId)
      setLoan(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`No loan found with ID ${loanId}.`)
      } else if (err.response) {
        setError(err.response.data.detail || 'Error fetching loan')
      } else {
        setError('Could not connect to the server. Make sure the backend is running on port 8000.')
      }
      setLoan(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      {error && (
        <div className="error-box">
          <div className="box-title">Error</div>
          {error}
        </div>
      )}

      <div className="card" style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div className="card-title">View Loan Details</div>

        <form onSubmit={handleSearch} className="form">
          <div className="search-bar">
            <FormField
              label="Loan ID"
              name="loan_id"
              type="number"
              value={loanId}
              onChange={(e) => {
                setLoanId(e.target.value)
                if (error) setError('')
              }}
              required
            />
            <button type="submit" className="inline-button" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Search'}
            </button>
          </div>
        </form>

        {loan && (
          <>
            <div className="result-section">
              <div className="section-title">Loan Details</div>
              <div className="result-row">
                <div className="result-label">Loan ID</div>
                <div className="result-value">{loan.loan_id}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Loan Amount</div>
                <div className="result-value">{formatINR(loan.loan_amount)}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Interest Rate</div>
                <div className="result-value">{loan.interest_rate}%</div>
              </div>
              <div className="result-row">
                <div className="result-label">Monthly Installment</div>
                <div className="result-value">{formatINR(loan.monthly_repayment)}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Tenure</div>
                <div className="result-value">{loan.tenure} months</div>
              </div>
            </div>

            <div className="result-section" style={{ background: '#f5f5f5' }}>
              <div className="section-title">Customer Details</div>
              <div className="result-row">
                <div className="result-label">Customer ID</div>
                <div className="result-value">{loan.customer.id}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Name</div>
                <div className="result-value">{loan.customer.first_name} {loan.customer.last_name}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Phone Number</div>
                <div className="result-value">{loan.customer.phone_number}</div>
              </div>
              <div className="result-row">
                <div className="result-label">Age</div>
                <div className="result-value">{loan.customer.age} years</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
