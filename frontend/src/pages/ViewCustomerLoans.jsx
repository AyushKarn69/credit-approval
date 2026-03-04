import { useState, useEffect } from 'react'
import FormField from '../components/FormField'
import LoadingSpinner from '../components/LoadingSpinner'
import { viewCustomerLoans } from '../api/loans'
import { formatINR, formatNumber } from '../utils/format'

export default function ViewCustomerLoans() {
  useEffect(() => {
    document.title = 'Customer Loans | Credit Approval System'
  }, [])

  const [customerId, setCustomerId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loans, setLoans] = useState(null)
  const [searchedId, setSearchedId] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')

    if (!customerId || parseInt(customerId) <= 0) {
      setError('Please enter a valid Customer ID')
      return
    }

    setLoading(true)
    try {
      const data = await viewCustomerLoans(customerId)
      setLoans(data)
      setSearchedId(customerId)
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Customer ID ${customerId} not found.`)
      } else if (err.response) {
        setError(err.response.data.detail || 'Error fetching loans')
      } else {
        setError('Could not connect to the server. Make sure the backend is running on port 8000.')
      }
      setLoans(null)
      setSearchedId('')
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

      <div className="card">
        <div className="card-title">Active Loans by Customer</div>

        <form onSubmit={handleSearch} className="form">
          <div className="search-bar">
            <FormField
              label="Customer ID"
              name="customer_id"
              type="number"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value)
                if (error) setError('')
              }}
              required
            />
            <button type="submit" className="inline-button" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Search'}
            </button>
          </div>
        </form>

        {loans !== null && (
          <>
            {loans.length > 0 ? (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Loan Amount</th>
                      <th>Interest Rate</th>
                      <th>Monthly EMI</th>
                      <th>EMIs Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => {
                      const emis_left = Math.max(0, loan.tenure - loan.emis_paid_on_time)
                      return (
                        <tr key={loan.loan_id}>
                          <td>{loan.loan_id}</td>
                          <td>{formatINR(loan.loan_amount)}</td>
                          <td>{loan.interest_rate}%</td>
                          <td>{formatINR(loan.monthly_repayment)}</td>
                          <td>{emis_left}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="table-info">
                  Showing {loans.length} active loan(s) for Customer ID {searchedId}
                </div>
              </>
            ) : (
              <div className="info-box" style={{ marginTop: '16px' }}>
                No active loans found for Customer ID {searchedId}.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
