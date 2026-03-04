export const formatINR = (amount) => {
  if (typeof amount !== 'number') {
    return 'Rs. 0'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return new Intl.NumberFormat('en-IN').format(num)
}
