import { format } from 'date-fns'

export function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  return format(d, 'dd LLL yyyy')
}

