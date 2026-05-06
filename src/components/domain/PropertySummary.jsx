import { Card } from '../ui/Card'

export function PropertySummary({ property }) {
  return (
    <Card>
      <div className="font-semibold text-brand-dark">{property?.name ?? 'Property'}</div>
      <div className="text-sm text-brand-mid">{property?.district ?? 'Kampala'}</div>
    </Card>
  )
}

