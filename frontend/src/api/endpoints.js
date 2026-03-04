import client from './client.js'

export async function registerCustomer(data) {
  const response = await client.post('/register', data)
  return response.data
}

export async function checkEligibility(data) {
  const response = await client.post('/check-eligibility', data)
  return response.data
}

export async function createLoan(data) {
  const response = await client.post('/create-loan', data)
  return response.data
}

export async function viewLoan(loanId) {
  const response = await client.get(`/view-loan/${loanId}`)
  return response.data
}

export async function viewCustomerLoans(customerId) {
  const response = await client.get(`/view-loans/${customerId}`)
  return response.data
}
