import client from './client'

export const registerCustomer = async (data) => {
  const response = await client.post('/register', {
    first_name: data.first_name,
    last_name: data.last_name,
    age: parseInt(data.age),
    monthly_income: parseInt(data.monthly_income),
    phone_number: data.phone_number
  })
  return response.data
}

export const checkEligibility = async (data) => {
  const response = await client.post('/check-eligibility', {
    customer_id: parseInt(data.customer_id),
    loan_amount: parseFloat(data.loan_amount),
    interest_rate: parseFloat(data.interest_rate),
    tenure: parseInt(data.tenure)
  })
  return response.data
}

export const createLoan = async (data) => {
  const response = await client.post('/create-loan', {
    customer_id: parseInt(data.customer_id),
    loan_amount: parseFloat(data.loan_amount),
    interest_rate: parseFloat(data.interest_rate),
    tenure: parseInt(data.tenure)
  })
  return response.data
}

export const viewLoan = async (loanId) => {
  const response = await client.get(`/view-loan/${parseInt(loanId)}`)
  return response.data
}

export const viewCustomerLoans = async (customerId) => {
  const response = await client.get(`/view-loans/${parseInt(customerId)}`)
  return response.data
}
