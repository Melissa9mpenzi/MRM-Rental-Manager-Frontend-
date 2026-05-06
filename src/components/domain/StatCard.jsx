import { Card } from '../ui/Card'

export function StatCard({ label, value }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-brand-mid">{label}</div>
      <div className="mt-1 text-2xl font-bold text-brand-dark">{value}</div>
    </Card>
  )
}

