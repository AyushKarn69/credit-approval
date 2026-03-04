export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function formatRate(r) {
  return `${parseFloat(r).toFixed(1)}%`
}

export function formatMonths(n) {
  return n === 1 ? '1 month' : `${n} months`
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN')
}
