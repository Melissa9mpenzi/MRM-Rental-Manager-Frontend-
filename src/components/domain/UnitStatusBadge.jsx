import { Badge } from '../ui/Badge'

export function UnitStatusBadge({ status }) {
  if (status === 'maintenance') return <Badge>Maintenance</Badge>
  if (status === 'occupied') return <Badge>Paid</Badge>
  return <Badge>Vacant</Badge>
}

