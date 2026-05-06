import { Card } from '../ui/Card'

export function TenantCard({ tenant }) {
  return (
    <Card>
      <div className="font-semibold text-brand-dark">{tenant?.full_name ?? 'Tenant'}</div>
      <div className="text-sm text-brand-mid">{tenant?.phone ?? ''}</div>
    </Card>
  )
}

