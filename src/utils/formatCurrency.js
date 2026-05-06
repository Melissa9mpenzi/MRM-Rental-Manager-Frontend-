export function formatCurrency(amount) {
  const n = typeof amount === 'number' ? amount : Number(amount ?? 0)
  return `UGX ${n.toLocaleString('en-UG')}`
}

